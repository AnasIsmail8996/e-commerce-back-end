import mongoose, { Schema, Document } from "mongoose";

export interface ISiteConfig extends Document {
  topbar: {
    text: string;
    link: string;
    enabled: boolean;
  };
  footer: {
    copyright: string;
    aboutUs: string;
    contactInfo: {
      email: string;
      phone: string;
    };
  };
  socialLinks: Array<{
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube";
    link: string;
  }>;
  carousel: Array<{
    image: string;
    link: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const siteConfigSchema = new Schema<ISiteConfig>(
  {
    topbar: {
      text: { type: String, default: "" },
      link: { type: String, default: "" },
      enabled: { type: Boolean, default: true },
    },
    footer: {
      copyright: { type: String, default: "" },
      aboutUs: { type: String, default: "" },
      contactInfo: {
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
      },
    },
    socialLinks: [
      {
        platform: {
          type: String,
          enum: ["facebook", "twitter", "instagram", "linkedin", "youtube"],
        },
        link: { type: String, default: "" },
      },
    ],
    carousel: [
      {
        image: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const SiteConfigModel =
  (mongoose.models.SiteConfig as mongoose.Model<ISiteConfig>) ||
  mongoose.model<ISiteConfig>("SiteConfig", siteConfigSchema);

export default SiteConfigModel;
