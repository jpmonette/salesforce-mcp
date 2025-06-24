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
    logging: {},
  },
});

server.tool(
  "update-records",
  "Update records",
  {
    records: z.array(
      z
        .object({
          Id: z.string().describe("Record ID"),
        })
        .passthrough()
        .describe("Record containing the ID and any other fielts to update."),
    ),
    sobject: z.string().describe("SObject Name"),
  },
  async ({ records, sobject }) => {
    const updatedRecords = await conn.sobject(sobject).update(records as any);

    return {
      content: [
        {
          type: "text",
          text: `Result of update(s):\n\n${JSON.stringify(
            updatedRecords,
            null,
            "  ",
          )}`,
        },
      ],
    };
  },
);

server.tool(
  "retrieve",
  "Retrieve a record by Salesforce ID",
  {
    id: z.string().describe("Record ID"),
    sobject: z.string().describe("SObject Name"),
  },
  async ({ id, sobject }) => {
    let data;

    try {
      data = await conn.sobject(sobject).retrieve(id);
    } catch (e) {
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
          text: `One record was retrieved:\n\n${JSON.stringify(
            data,
            null,
            "  ",
          )}`,
        },
      ],
    };
  },
);

server.tool(
  "anonymous-apex",
  "Execute Anonymous Apex",
  {
    apexBody: z.string().describe("Anonymous Apex Body"),
  },
  async ({ apexBody }) => {
    const res = await conn.tooling.executeAnonymous(apexBody);
    console.log(`compiled?: ${res.compiled}`); // compiled successfully
    console.log(`executed?: ${res.success}`); // executed successfully

    return {
      content: [
        {
          type: "text",
          text: `compiled?: ${res.compiled}, executed?: ${
            res.success
          }, lines:\n\n${JSON.stringify(res, null, "  ")}`,
        },
      ],
    };
  },
);

server.tool(
  "triggers-by-sobject",
  "Get Apex Triggers by SObject",
  {
    sobject: z.string().describe("SObject Name"),
  },
  async ({ sobject }) => {
    console.log("Get Apex Triggers by SObject");
    const records = await conn.tooling
      .sobject("ApexTrigger")
      .find({ TableEnumOrId: sobject })
      .execute();

    console.log("Getting Triggers", sobject, records);

    return {
      content: [
        {
          type: "text",
          text: `${
            records.length
          } Apex Triggers were found on ${sobject}:\n\n${JSON.stringify(
            records,
            null,
            "  ",
          )}`,
        },
      ],
    };
  },
);

server.tool(
  "create-custom-field",
  "Create a Custom Field",
  {
    customField: z.object({
      Metadata: z.object({
        type: z
          .enum([
            "Address",
            "AutoNumber",
            "Lookup",
            "MasterDetail",
            "MetadataRelationship",
            "Checkbox",
            "Currency",
            "Date",
            "DateTime",
            "Email",
            "EncryptedText",
            "Note",
            "ExternalLookup",
            "IndirectLookup",
            "Number1",
            "Percent",
            "Phone",
            "Picklist",
            "MultiselectPicklist",
            "Summary",
            "Text",
            "TextArea",
            "LongTextArea",
            "Url",
            "Hierarchy",
            "File",
            "Html",
            "Location",
            "Time",
          ])
          .describe("field type"),
        description: z.string().describe("the description of the field"),
        inlineHelpText: z
          .string()
          .optional()
          .describe("the inline text of the field"),
        label: z.string().describe("the label of the field"),
        length: z.number().optional().describe("the field length of the field"),
        required: z.boolean().describe("if it is required or not"),
      }),
      FullName: z
        .string()
        .describe(
          "the full name of the field, which is formatted as `sobjectName.fieldname__c`. For example, `Account.Name__c` or `My_Custom_Object__c.First_Name__c`.",
        ),
    }),
  },
  async ({ customField }) => {
    const savedResult = await conn.tooling
      .sobject("CustomField")
      .create(customField);

    return {
      content: [
        {
          type: "text",
          text: `Result:\n\n${JSON.stringify(savedResult, null, "  ")}`,
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

    const text = `Records found for the ${sobject} SObject:\n\n${formattedResults.join(
      "---\n",
    )}`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, "  "),
        },
      ],
    };
  },
);

server.tool(
  "soql-query",
  "Execute a SOQL query",
  {
    soqlQueryString: z.string().describe("SOQL query string"),
  },
  async ({ soqlQueryString }) => {
    const data = await conn.query(soqlQueryString);

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

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, "  "),
        },
      ],
    };
  },
);
