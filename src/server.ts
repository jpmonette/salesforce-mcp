import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import jsforce from "jsforce";
import { z } from "zod";

const conn = new jsforce.Connection();
await conn.login(
  process.env.SALESFORCE_USERNAME!,
  process.env.SALESFORCE_PASSWORD!,
);

export const server = new McpServer({
  name: "Salesforce MCP",
  version: "0.1.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "retrieve",
  "Retrieve a record by Salesforce ID",
  {
    id: z.string().describe("Record ID"),
    sobject: z.string().describe("SObject Name"),
  },
  async ({ id, sobject }) => {
    const data = await conn.sobject(sobject).retrieve(id);

    if (!data.done) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve record",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `One record was retrieved:\n\n${Object.entries(data)
            .filter(([_, value]) => typeof value !== "object")
            .map(([key, value]) => key + ": " + value)
            .join("\n")}`,
        },
      ],
    };
  },
);

server.tool(
  "count",
  "Count Salesforce records",
  {
    sobject: z.string().describe("SObject Name"),
  },
  async ({ sobject }) => {
    const data = await conn.query(`select COUNT() from ${sobject}`);

    if (!data.done) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to count records",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Count for SObject ${sobject}: ${data.totalSize}`,
        },
      ],
    };
  },
);

server.tool(
  "query-records",
  "Search Salesforce records",
  {
    sobject: z.string().describe("SObject Name"),
    list_of_fields: z
      .string()
      .describe("Comma separated list of fields")
      .default("Id, Name"),
    limit: z.number().describe("Limit of records").default(10),
  },
  async ({ sobject, list_of_fields, limit }) => {
    const data = await conn.query(
      `select ${list_of_fields} from ${sobject} limit ${limit}`,
    );

    if (!data.done) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve records",
          },
        ],
      };
    }

    const formattedResults = data.records.map((record) => {
      return Object.entries(record)
        .filter(([_, value]) => typeof value !== "object")
        .map(([field, value]) => field + ": " + value || "Unknown")
        .join("\n");
    });

    const text = `Records for ${sobject}:\n\n${formattedResults.join("---\n")}`;

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  },
);
