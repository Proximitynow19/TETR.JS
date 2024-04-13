import WebSocketManager from "../ws/WebSocketManager";
import ClientUser from "./ClientUser";
import api from "../util/api";
import Room from "../room/Room";
import User from "../user/User";
import channelApi from "../util/channelApi";
import { EventEmitter } from "ws";

/**
 * Represents the client.
 */
export default class Client extends EventEmitter {
  private readonly ws = new WebSocketManager(this);

  /**
   * The client's token.
   */
  public token?: string;
  /**
   * Details and actions that relate to the client's user.
   */
  public me?: ClientUser;
  /**
   * Details about the current room.
   *
   * @readonly
   */
  public readonly room = new Room(this.ws);

  /**
   * Login with a authentication token.
   * @param token The authentication token
   *
   * @example
   * ```
   * await client.login(process.env.TOKEN);
   * ```
   */
  public async login(token: string): Promise<void> {
    this.token = token;

    let me = await api("/users/me", token, undefined, undefined, undefined, {
      expire: new Date().getTime() + 5 * 60000,
      key: "users_me_" + token,
    });

    if (me.user.role !== "bot")
      throw new Error(
        `Client "${me.user.username}" is not a bot account. Contact TETR.IO Support (https://tetr.io/about/support/) to apply for a bot account.`
      );

    this.me = new ClientUser(this.ws, me, await this.fetchUser(me.user._id));

    await this.ws.connect();
  }

  /**
   * Login with a username/password combo.
   * @param username The username of the account
   * @param password The password of the account
   *
   * @example
   * ```
   * await client.login_password(process.env.USERNAME, process.env.PASSWORD);
   * ```
   *
   * @remarks
   *
   * A "user" account must not be used and a "bot" account is required. To obtain one, contact [osk](https://osk.sh/).
   */
  public async login_password(username: string, password: string): Promise<void> {
    let auth = await api("/users/authenticate", undefined, undefined, "POST", {
      username,
      password,
    });

    await this.login(auth.token);
  }

  public logout(): void {
    this.ws.mayReconnect = false;
    this.ws.send({ command: "die" }, false);
    clearInterval(this.ws.heartbeat);
    this.ws.socket?.close();
  }

  /**
   * Search TetraChannel and return a full User object.
   * @param user User ID or Username
   * @returns A User object matching the provided details
   *
   * @example
   * ```
   * // '5f91f037630a88df78736f78':
   * (await client.fetchUser("proximitynow")).id;
   * ```
   */
  public async fetchUser(user: string): Promise<User> {
    let user_ = await channelApi(`/users/${user}`);

    return new User(this.ws, user_);
  }
}

export default interface Client extends EventEmitter {
  /** Emitted when the client violates Ribbon's protocol. */
  on(eventName: "nope", listener: (reason: string) => void): this;

  /** Emitted when the client gets kicked by the server. */
  on(eventName: "kick", listener: (reason: string) => void): this;

  /** Emitted when a non fatal error occurs. */
  on(eventName: "err", listener: (reason: string) => void): this;
}
