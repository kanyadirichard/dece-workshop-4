import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};

export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  return { publicKey, privateKey };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  return key.export({ type: "spki", format: "pem" }).toString();
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (!key) return null;
  return key.export({ type: "pkcs8", format: "pem" }).toString();
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  
  return crypto.createPublicKey({ key: strKey, format: "pem", type: "spki" });
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {

  return crypto.createPrivateKey({ key: strKey, format: "pem", type: "pkcs8" });
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  const dataBuffer = base64ToArrayBuffer(b64Data);
  const encryptedData = crypto.publicEncrypt(publicKey, dataBuffer);

  return encryptedData.toString("base64");
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const encryptedDataBuffer = base64ToArrayBuffer(data);
  const decryptedData = crypto.privateDecrypt(privateKey, encryptedDataBuffer);

  return decryptedData.toString("utf-8");
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  const key = crypto.randomBytes(32); // Generate a 256-bit (32-byte) random key

  return crypto.createSecretKey(key);
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const keyBuffer = key.export({ type: "raw", format: "buffer" });
  const base64Key = keyBuffer.toString("base64");
  
  return base64Key;
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const keyBuffer = Buffer.from(strKey, "base64");

  return crypto.createSecretKey(keyBuffer);
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(data);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedData = cipher.update(dataUint8);
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);
  const combinedData = Buffer.concat([iv, encryptedData]);
  const base64Data = combinedData.toString("base64");

  return base64Data;
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  const keyBuffer = Buffer.from(strKey, "base64");
  const key = crypto.createSecretKey(keyBuffer);
  const encryptedDataBuffer = base64ToArrayBuffer(encryptedData);
  const iv = encryptedDataBuffer.slice(0, 16);
  const data = encryptedDataBuffer.slice(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decryptedData = decipher.update(data);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);

  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedData);

  return decryptedString;
}
