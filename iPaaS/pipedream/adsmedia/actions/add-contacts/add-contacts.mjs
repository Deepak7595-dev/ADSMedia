import adsmedia from "../../adsmedia.app.mjs";

export default {
  key: "adsmedia-add-contacts",
  name: "Add Contacts to List",
  description: "Add contacts to a list in ADSMedia. [See the documentation](https://www.adsmedia.ai/api-docs)",
  version: "1.0.0",
  type: "action",
  props: {
    adsmedia,
    listId: {
      propDefinition: [adsmedia, "listId"],
    },
    contacts: {
      type: "string[]",
      label: "Contacts",
      description: "Array of contacts. Can be email strings or JSON objects: `{\"email\": \"user@example.com\", \"firstName\": \"John\", \"lastName\": \"Doe\"}`",
    },
  },
  async run({ $ }) {
    // Parse contacts
    const parsedContacts = this.contacts.map((c) => {
      if (typeof c === "string") {
        try {
          return JSON.parse(c);
        } catch {
          return { email: c };
        }
      }
      return c;
    });

    const response = await this.adsmedia.addContacts($, this.listId, parsedContacts);

    $.export("$summary", `Added ${parsedContacts.length} contacts to list ${this.listId}`);
    return response;
  },
};

