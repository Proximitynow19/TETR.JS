import api from "../util/api";
import Client from "../client/Client";
import { Packr, Unpackr } from "msgpackr";
import { readdirSync } from "fs";
import { join } from "path";
import WebSocket from "ws";
import EventEmitter from "node:events";

const { unpack } = new Unpackr({
  int64AsType: "number",
  bundleStrings: true,
  sequential: false,
});

export default class WebSocketManager extends EventEmitter {
  static readonly MESSAGE_TYPE = {
    STANDARD: 0x45,
    EXTRACTED_ID: 0xae,
    BATCH: 0x58,
    EXTENSION: 0xb0,
  };
  static readonly EXTENSION = { PING: 0x0b, PONG: 0x0c };

  constructor(client: Client) {
    super();

    this.client = client;
    const { pack } = new Packr({
      int64AsType: "number",
      bundleStrings: true,
      sequential: false,
    });
    this.pack = pack;
    const { unpack } = new Unpackr({
      int64AsType: "number",
      bundleStrings: true,
      sequential: false,
    });
    this.unpack = unpack;
  }

  private pack: (value: any) => Buffer | Uint8Array;
  private unpack: (messagePack: Buffer | Uint8Array) => any;

  private commands: Map<string, (ws: WebSocketManager, message: any) => Promise<void> | void> =
    new Map(
      readdirSync(join(__dirname, "commands"))
        .filter((file: string) => file.endsWith(__filename.slice(__filename.length - 3)))
        .map((file: string) => [
          file.slice(0, -3),
          require(join(__dirname, "commands", file)).default,
        ])
    );
  private lastIddCalculation = Date.now();
  private spool?: any;

  public mayReconnect = true;
  public heartbeat?: NodeJS.Timeout;
  public socket?: WebSocket;
  public client: Client;
  public socketId?: string;
  public resumeToken?: string;
  public messageId = 0;
  public serverId = 0;
  public clientIdd: any[] = [];

  private async getOptimalSpool({ spools: { spools } }: any) {
    let spool;

    if (
      (spool = await Promise.race(
        spools.map(
          (spool: any) =>
            new Promise<any>(async (resolve, reject) => {
              let spool_ = await checkSpool(spool);

              if (!spool_ || !spool_.health.flags.online || spool_.health.flags.avoidDueToHighLoad)
                return reject();

              resolve(spool_);
            })
        )
      ))
    )
      return spool;

    if (
      (spool = await Promise.race(
        spools.map(
          (spool: any) =>
            new Promise<any>(async (resolve, reject) => {
              let spool_ = await checkSpool(spool);

              if (!spool_.health.flags.online) return reject();

              resolve(spool_);
            })
        )
      ))
    )
      return spool;

    return "tetr.io";

    async function checkSpool(spool: any) {
      try {
        let data = await fetch(`https://${spool.host}/spool`);

        let health_ = Buffer.from(await data.arrayBuffer());

        let flags_ = health_.readUint8(1);

        return {
          ...spool,
          health: {
            version: health_.readUint8(),
            flags: {
              online: flags_ & 0b10000000,
              avoidDueToHighLoad: flags_ & 0b01000000,
              recentlyRestarted: flags_ & 0b00100000,
            },
            load1m: health_.readUint8(2) / 64,
            load5m: health_.readUint8(3) / 64,
            load15m: health_.readUint8(4) / 64,
          },
        };
      } catch {
        return null;
      }
    }
  }

  public async connect(resume = false, endpoint?: string): Promise<void> {
    let ribbon = await api("/server/ribbon", this.client.token, undefined, undefined, undefined, {
      expire: new Date().getTime() + 15 * 60000,
      key: "server_ribbon_" + this.client.token,
    });

    if (!this.spool) this.spool = await this.getOptimalSpool(ribbon);

    if (!endpoint) ({ endpoint } = ribbon);

    this.socket = new WebSocket(`wss://${this.spool.host}${endpoint}`, ribbon.spools.token);

    this.socket.on("error", (err: string) => {
      throw new Error(err);
    });

    this.socket.on("close", () => {
      this.mayReconnect && this.connect(true); // i guess temporary fix on silent disconnect
    });

    this.socket.on("open", () => {
      if (resume) {
        this.send(
          {
            command: "resume",
            socketid: this.socketId,
            resumetoken: this.resumeToken,
          },
          false
        );
      } else {
        setTimeout(() => {
          this.send({ command: "new" }, false);
        }, 1000);
      }

      this.heartbeat = setInterval(() => {
        this.socket?.send(
          Buffer.from([WebSocketManager.MESSAGE_TYPE.EXTENSION, WebSocketManager.EXTENSION.PING])
        );
      }, 5000);
    });

    this.socket.on("message", (data: Buffer) => {
      switch (Number(data.readUint8())) {
        case WebSocketManager.MESSAGE_TYPE.STANDARD:
          this.receive(this.unpack(data.subarray(1)));
          break;
        case WebSocketManager.MESSAGE_TYPE.EXTRACTED_ID:
          this.receive(unpack(data.subarray(5)), data.readUint32BE(1));
          break;
        case WebSocketManager.MESSAGE_TYPE.BATCH:
          let lengths: number[] = [];
          let length = 0;
          while ((length = data.readUint32BE(lengths.length * 4 + 1)) !== 0) {
            lengths.push(length);
          }
          lengths.forEach((length, i) => {
            let offset = lengths.slice(0, i).reduce((a, b) => a + b, 5 + lengths.length * 4);
            this.socket?.emit("message", data.subarray(offset, offset + length));
          });
          break;
        case WebSocketManager.MESSAGE_TYPE.EXTENSION:
          // ping / pong
          break;
      }
    });

    await new Promise<void>((resolve) => {
      this.once(resume ? "hello" : "authorize", () => {
        resolve();
      });
    });
  }

  public send(message: any, id = true, type = WebSocketManager.MESSAGE_TYPE.STANDARD) {
    if (id) {
      message.id = ++this.messageId;

      this.clientIdd.push(message);

      if (message.id % 100 === 0) {
        let currentCalculation = Date.now();
        this.clientIdd = this.clientIdd.slice(
          0,
          Math.max(
            100,
            Math.min(30 * (1000 / (currentCalculation - this.lastIddCalculation)), 2000)
          )
        );
        this.lastIddCalculation = currentCalculation;
      }
    }

    // console.log("out :", message);

    this.socket?.send(Buffer.concat([Buffer.from([type]), this.pack(message)]));
  }

  public async receive(message: any, id?: number) {
    if (id) message.id = id;

    if (typeof message.id === "number") {
      this.serverId = message.id;
    }

    let command = this.commands.get(message.command);

    if (command) await command(this, message);

    // if (!command) console.log("unknown in :\n", message);

    this.emit(message.command, message);
  }
}
