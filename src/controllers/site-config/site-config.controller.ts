import { Request, Response } from "express";
import SiteConfigModel from "../../models/site-config.model";

export const getSiteConfig = async (_req: Request, res: Response) => {
  try {
    let config = await SiteConfigModel.findOne();
    if (!config) {
      config = await SiteConfigModel.create({});
    }
    return res.status(200).json({ success: true, config });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch site config",
    });
  }
};

export const updateSiteConfig = async (req: Request, res: Response) => {
  try {
    const { topbar, footer, socialLinks, carousel } = req.body;

    let config = await SiteConfigModel.findOne();
    if (!config) {
      config = new SiteConfigModel();
    }

    if (topbar !== undefined) config.topbar = { ...config.topbar, ...topbar };
    if (footer !== undefined) config.footer = { ...config.footer, ...footer };
    if (socialLinks !== undefined) config.socialLinks = socialLinks;
    if (carousel !== undefined) config.carousel = carousel;

    const updated = await config.save();

    return res.status(200).json({
      success: true,
      message: "Site config updated successfully",
      config: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update site config",
    });
  }
};
