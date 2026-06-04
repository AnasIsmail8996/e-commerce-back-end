import { Request, Response } from "express";
import SiteConfigModel from "../../models/site-config.model";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";
import { uploadMultiple } from "../../utils/uploadToCloudinary";

export const getSiteConfig = asyncHandler(async (_req: Request, res: Response) => {
  let config = await SiteConfigModel.findOne();
  if (!config) {
    config = await SiteConfigModel.create({});
  }
  return sendSuccess(res, { config });
});

export const updateSiteConfig = asyncHandler(async (req: Request, res: Response) => {
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

  return sendSuccess(res, { config: updated, message: "Site config updated successfully" });
});

export const uploadCarouselImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return sendError(res, "No images provided", 400);
  }

  const uploaded = await uploadMultiple(files, "carousel");
  const images = uploaded.map((img) => ({ image: img.url, link: "" }));

  return sendSuccess(res, {
    images,
    message: "Carousel images uploaded successfully",
  });
});
