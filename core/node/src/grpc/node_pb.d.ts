// package: node
// file: node.proto

import * as jspb from "google-protobuf";

export class ValidatorMessage extends jspb.Message {
  getPublickey(): string;
  setPublickey(value: string): void;

  getStake(): number;
  setStake(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidatorMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ValidatorMessage): ValidatorMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidatorMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidatorMessage;
  static deserializeBinaryFromReader(message: ValidatorMessage, reader: jspb.BinaryReader): ValidatorMessage;
}

export namespace ValidatorMessage {
  export type AsObject = {
    publickey: string,
    stake: number,
  }
}

export class TransactionMessage extends jspb.Message {
  getPublickey(): string;
  setPublickey(value: string): void;

  getTo(): string;
  setTo(value: string): void;

  getAmount(): number;
  setAmount(value: number): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

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
    publickey: string,
    to: string,
    amount: number,
    timestamp: number,
    signature: string,
  }
}

export class BlockMessage extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getValidator(): string;
  setValidator(value: string): void;

  getParenthash(): string;
  setParenthash(value: string): void;

  getHash(): string;
  setHash(value: string): void;

  clearTransactionsList(): void;
  getTransactionsList(): Array<TransactionMessage>;
  setTransactionsList(value: Array<TransactionMessage>): void;
  addTransactions(value?: TransactionMessage, index?: number): TransactionMessage;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BlockMessage): BlockMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlockMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockMessage;
  static deserializeBinaryFromReader(message: BlockMessage, reader: jspb.BinaryReader): BlockMessage;
}

export namespace BlockMessage {
  export type AsObject = {
    height: number,
    timestamp: number,
    validator: string,
    parenthash: string,
    hash: string,
    transactionsList: Array<TransactionMessage.AsObject>,
  }
}

export class StatusRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StatusRequest): StatusRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StatusRequest;
  static deserializeBinaryFromReader(message: StatusRequest, reader: jspb.BinaryReader): StatusRequest;
}

export namespace StatusRequest {
  export type AsObject = {
  }
}

export class StatusReply extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatusReply.AsObject;
  static toObject(includeInstance: boolean, msg: StatusReply): StatusReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StatusReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StatusReply;
  static deserializeBinaryFromReader(message: StatusReply, reader: jspb.BinaryReader): StatusReply;
}

export namespace StatusReply {
  export type AsObject = {
    status: string,
    timestamp: number,
  }
}

export class ListValidatorsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListValidatorsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListValidatorsRequest): ListValidatorsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListValidatorsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListValidatorsRequest;
  static deserializeBinaryFromReader(message: ListValidatorsRequest, reader: jspb.BinaryReader): ListValidatorsRequest;
}

export namespace ListValidatorsRequest {
  export type AsObject = {
  }
}

export class ListValidatorsResponse extends jspb.Message {
  clearValidatorsList(): void;
  getValidatorsList(): Array<ValidatorMessage>;
  setValidatorsList(value: Array<ValidatorMessage>): void;
  addValidators(value?: ValidatorMessage, index?: number): ValidatorMessage;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListValidatorsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListValidatorsResponse): ListValidatorsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListValidatorsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListValidatorsResponse;
  static deserializeBinaryFromReader(message: ListValidatorsResponse, reader: jspb.BinaryReader): ListValidatorsResponse;
}

export namespace ListValidatorsResponse {
  export type AsObject = {
    validatorsList: Array<ValidatorMessage.AsObject>,
  }
}

export class AddValidatorRequest extends jspb.Message {
  getPublickey(): string;
  setPublickey(value: string): void;

  getStake(): number;
  setStake(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddValidatorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddValidatorRequest): AddValidatorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddValidatorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddValidatorRequest;
  static deserializeBinaryFromReader(message: AddValidatorRequest, reader: jspb.BinaryReader): AddValidatorRequest;
}

export namespace AddValidatorRequest {
  export type AsObject = {
    publickey: string,
    stake: number,
  }
}

export class AddValidatorResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddValidatorResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddValidatorResponse): AddValidatorResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddValidatorResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddValidatorResponse;
  static deserializeBinaryFromReader(message: AddValidatorResponse, reader: jspb.BinaryReader): AddValidatorResponse;
}

export namespace AddValidatorResponse {
  export type AsObject = {
    message: string,
  }
}

export class RemoveValidatorRequest extends jspb.Message {
  getPublickey(): string;
  setPublickey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveValidatorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveValidatorRequest): RemoveValidatorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemoveValidatorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveValidatorRequest;
  static deserializeBinaryFromReader(message: RemoveValidatorRequest, reader: jspb.BinaryReader): RemoveValidatorRequest;
}

export namespace RemoveValidatorRequest {
  export type AsObject = {
    publickey: string,
  }
}

export class RemoveValidatorResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveValidatorResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveValidatorResponse): RemoveValidatorResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemoveValidatorResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveValidatorResponse;
  static deserializeBinaryFromReader(message: RemoveValidatorResponse, reader: jspb.BinaryReader): RemoveValidatorResponse;
}

export namespace RemoveValidatorResponse {
  export type AsObject = {
    message: string,
  }
}

export class AnnouncePeerRequest extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnnouncePeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AnnouncePeerRequest): AnnouncePeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnnouncePeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnnouncePeerRequest;
  static deserializeBinaryFromReader(message: AnnouncePeerRequest, reader: jspb.BinaryReader): AnnouncePeerRequest;
}

export namespace AnnouncePeerRequest {
  export type AsObject = {
    address: string,
  }
}

export class AnnouncePeerResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  clearCurrentPeersList(): void;
  getCurrentPeersList(): Array<string>;
  setCurrentPeersList(value: Array<string>): void;
  addCurrentPeers(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnnouncePeerResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AnnouncePeerResponse): AnnouncePeerResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnnouncePeerResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnnouncePeerResponse;
  static deserializeBinaryFromReader(message: AnnouncePeerResponse, reader: jspb.BinaryReader): AnnouncePeerResponse;
}

export namespace AnnouncePeerResponse {
  export type AsObject = {
    message: string,
    currentPeersList: Array<string>,
  }
}

export class SyncValidatorUpdateRequest extends jspb.Message {
  getUpdateType(): SyncValidatorUpdateRequest.UpdateTypeMap[keyof SyncValidatorUpdateRequest.UpdateTypeMap];
  setUpdateType(value: SyncValidatorUpdateRequest.UpdateTypeMap[keyof SyncValidatorUpdateRequest.UpdateTypeMap]): void;

  getPublickey(): string;
  setPublickey(value: string): void;

  getStake(): number;
  setStake(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SyncValidatorUpdateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SyncValidatorUpdateRequest): SyncValidatorUpdateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SyncValidatorUpdateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SyncValidatorUpdateRequest;
  static deserializeBinaryFromReader(message: SyncValidatorUpdateRequest, reader: jspb.BinaryReader): SyncValidatorUpdateRequest;
}

export namespace SyncValidatorUpdateRequest {
  export type AsObject = {
    updateType: SyncValidatorUpdateRequest.UpdateTypeMap[keyof SyncValidatorUpdateRequest.UpdateTypeMap],
    publickey: string,
    stake: number,
  }

  export interface UpdateTypeMap {
    ADD: 0;
    REMOVE: 1;
  }

  export const UpdateType: UpdateTypeMap;
}

export class SyncValidatorUpdateResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SyncValidatorUpdateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SyncValidatorUpdateResponse): SyncValidatorUpdateResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SyncValidatorUpdateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SyncValidatorUpdateResponse;
  static deserializeBinaryFromReader(message: SyncValidatorUpdateResponse, reader: jspb.BinaryReader): SyncValidatorUpdateResponse;
}

export namespace SyncValidatorUpdateResponse {
  export type AsObject = {
    message: string,
  }
}

export class GossipPeersRequest extends jspb.Message {
  getFromAddress(): string;
  setFromAddress(value: string): void;

  clearPeersList(): void;
  getPeersList(): Array<string>;
  setPeersList(value: Array<string>): void;
  addPeers(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GossipPeersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GossipPeersRequest): GossipPeersRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GossipPeersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GossipPeersRequest;
  static deserializeBinaryFromReader(message: GossipPeersRequest, reader: jspb.BinaryReader): GossipPeersRequest;
}

export namespace GossipPeersRequest {
  export type AsObject = {
    fromAddress: string,
    peersList: Array<string>,
  }
}

export class GossipPeersResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  clearKnownPeersList(): void;
  getKnownPeersList(): Array<string>;
  setKnownPeersList(value: Array<string>): void;
  addKnownPeers(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GossipPeersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GossipPeersResponse): GossipPeersResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GossipPeersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GossipPeersResponse;
  static deserializeBinaryFromReader(message: GossipPeersResponse, reader: jspb.BinaryReader): GossipPeersResponse;
}

export namespace GossipPeersResponse {
  export type AsObject = {
    message: string,
    knownPeersList: Array<string>,
  }
}

export class AnnounceBlockRequest extends jspb.Message {
  hasBlock(): boolean;
  clearBlock(): void;
  getBlock(): BlockMessage | undefined;
  setBlock(value?: BlockMessage): void;

  getFromPeer(): string;
  setFromPeer(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnnounceBlockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AnnounceBlockRequest): AnnounceBlockRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnnounceBlockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnnounceBlockRequest;
  static deserializeBinaryFromReader(message: AnnounceBlockRequest, reader: jspb.BinaryReader): AnnounceBlockRequest;
}

export namespace AnnounceBlockRequest {
  export type AsObject = {
    block?: BlockMessage.AsObject,
    fromPeer: string,
  }
}

export class AnnounceBlockResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnnounceBlockResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AnnounceBlockResponse): AnnounceBlockResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnnounceBlockResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnnounceBlockResponse;
  static deserializeBinaryFromReader(message: AnnounceBlockResponse, reader: jspb.BinaryReader): AnnounceBlockResponse;
}

export namespace AnnounceBlockResponse {
  export type AsObject = {
    message: string,
  }
}

export class GetChainRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChainRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetChainRequest): GetChainRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetChainRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChainRequest;
  static deserializeBinaryFromReader(message: GetChainRequest, reader: jspb.BinaryReader): GetChainRequest;
}

export namespace GetChainRequest {
  export type AsObject = {
  }
}

export class GetChainResponse extends jspb.Message {
  clearBlocksList(): void;
  getBlocksList(): Array<BlockMessage>;
  setBlocksList(value: Array<BlockMessage>): void;
  addBlocks(value?: BlockMessage, index?: number): BlockMessage;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChainResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetChainResponse): GetChainResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetChainResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChainResponse;
  static deserializeBinaryFromReader(message: GetChainResponse, reader: jspb.BinaryReader): GetChainResponse;
}

export namespace GetChainResponse {
  export type AsObject = {
    blocksList: Array<BlockMessage.AsObject>,
  }
}

export class SubmitTransactionResponse extends jspb.Message {
  getTransactionId(): string;
  setTransactionId(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

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
    transactionId: string,
    message: string,
  }
}

export class AnnounceTransactionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnnounceTransactionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AnnounceTransactionResponse): AnnounceTransactionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnnounceTransactionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnnounceTransactionResponse;
  static deserializeBinaryFromReader(message: AnnounceTransactionResponse, reader: jspb.BinaryReader): AnnounceTransactionResponse;
}

export namespace AnnounceTransactionResponse {
  export type AsObject = {
    message: string,
  }
}

