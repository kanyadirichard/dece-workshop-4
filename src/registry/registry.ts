import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { generateRsaKeyPair } from "../crypto";
import * as console from "console";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  let registeredNodes: GetNodeRegistryBody = { nodes: [] };

  _registry.post("/registerNode", (req, res) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    if (nodeId !== undefined && nodeId !== null && pubKey) {
      const newNode: Node = { nodeId, pubKey };
      registeredNodes.nodes.push(newNode);
      res.status(201).json({ message: "Node registered successfully" });
    } else {
      res.status(400).json({ error: "Invalid request body" });
    }
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    res.json(registeredNodes);
  });
  
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}