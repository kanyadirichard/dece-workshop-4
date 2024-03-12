import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const registeredNodes: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());


  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "Node ID and public key are required." });
    }

    if (registeredNodes.some(node => node.nodeId === nodeId)) {
      return res.status(400).json({ error: `Node ${nodeId} is already registered.` });
    }

    registeredNodes.push({ nodeId, pubKey });

    res.status(200).json({ message: `Node ${nodeId} registered successfully.` });
  });
  
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
