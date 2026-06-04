export const features = [
  {
    title: "Rendered capture",
    text: "ExportKit opens public pages in a browser runtime so modern routes, images, and styles are captured after rendering."
  },
  {
    title: "Static archive",
    text: "Pages and same-origin assets are packaged into a ZIP that can move to storage, review, or handoff workflows."
  },
  {
    title: "Permission first",
    text: "Every export asks for ownership or permission confirmation before a job starts."
  }
];

export const steps = [
  "Paste a public website URL.",
  "Confirm you have permission to export it.",
  "Watch page and asset capture progress.",
  "Download the finished static ZIP archive."
];

export const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For one-off tests and small public pages.",
    features: ["Manual exports", "Local download", "Basic progress log"]
  },
  {
    name: "Studio",
    price: "$19",
    description: "For teams exporting marketing and prototype sites.",
    features: ["Larger export jobs", "Priority queue", "Reusable project history"]
  },
  {
    name: "Scale",
    price: "$79",
    description: "For agencies and product teams with recurring handoffs.",
    features: ["Team access", "Advanced asset checks", "Dedicated support"]
  }
];
