import * as fs from "fs";
import * as path from "path";
import * as forge from "node-forge";
import { SignedXml } from "xml-crypto";
import { config } from "../config/env";

function loadCertificateAndKey(): { privateKeyPem: string; certPem: string } {
  const p12Path = path.join(__dirname, "..", config.certPath);
  const p12Buffer = fs.readFileSync(p12Path, "binary");
  const p12Asn1 = forge.asn1.fromDer(p12Buffer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.certPassword);

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

  const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]![0];
  const certBag = certBags[forge.pki.oids.certBag]![0];

  const privateKeyPem = forge.pki.privateKeyToPem(keyBag.key!);
  const certPem = forge.pki.certificateToPem(certBag.cert!);

  return { privateKeyPem, certPem };
}

function bigIntToBase64(n: forge.jsbn.BigInteger): string {
  let hex = n.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  return Buffer.from(hex, "hex").toString("base64");
}

function buildKeyInfoContent(certPem: string): string {
  const cert = forge.pki.certificateFromPem(certPem);
  const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;

  const modulusB64 = bigIntToBase64(publicKey.n);
  const exponentB64 = bigIntToBase64(publicKey.e);

  const certDer = forge.asn1
    .toDer(forge.pki.certificateToAsn1(cert))
    .getBytes();
  const certB64 = forge.util.encode64(certDer);

  const keyInfoXml =
    "<KeyValue><RSAKeyValue><Modulus>" +
    modulusB64 +
    "</Modulus><Exponent>" +
    exponentB64 +
    "</Exponent></RSAKeyValue></KeyValue><X509Data><X509Certificate>" +
    certB64 +
    "</X509Certificate></X509Data>";

  return keyInfoXml;
}

export function signDocument(xml: string): string {
  const { privateKeyPem, certPem } = loadCertificateAndKey();

  const sig = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
    signatureAlgorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
    canonicalizationAlgorithm:
      "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments",
    getKeyInfoContent: () => buildKeyInfoContent(certPem),
  });

  sig.addReference({
    xpath: "/*",
    digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1",
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    uri: "",
    isEmptyUri: true,
  });

  sig.computeSignature(xml);

  return sig.getSignedXml();
}
