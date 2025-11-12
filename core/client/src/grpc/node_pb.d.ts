// package: node
// file: node.proto

import * as jspb from "google-protobuf";

export class TransactionMessage extends jspb.Message {
  getTo(): string;
  setTo(value: string): void;

  getAmount(): number;
  setAmount(value: number): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getPublickey(): string;
  setPublickey(value: string): void;

  getSignature(): string;
  setSignature(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionMessage.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionMessage): TransactionMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TransactionMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionMessage;
  static deserializeBinaryFromReader(message: TransactionMessage, reader: jspb.BinaryReader): TransactionMessage;
}

export namespace TransactionMessage {
  export type AsObject = {
    to: string,
    amount: number,
    timestamp: number,
    publickey: string,
    signature: string,
  }
}

export class SubmitTransactionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getTransactionId(): string;
  setTransactionId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitTransactionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubmitTransactionResponse): SubmitTransactionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubmitTransactionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubmitTransactionResponse;
  static deserializeBinaryFromReader(message: SubmitTransactionResponse, reader: jspb.BinaryReader): SubmitTransactionResponse;
}

export namespace SubmitTransactionResponse {
  export type AsObject = {
    message: string,
    transactionId: string,
  }
}

