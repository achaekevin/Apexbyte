import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import settingService from '../services/setting.service';

/**
 * GET /api/settings/public
 * Returns key-value pairs of all public store settings.
 */
export const getPublicSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingService.getPublicSettings();
  res.json({
    success: true,
    data,
  });
});

/**
 * GET /api/settings
 * Admin endpoint: returns all settings with definitions, groups, and active values.
 */
export const getAllSettingsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingService.getAllSettingsAdmin();
  res.json({
    success: true,
    data,
  });
});

/**
 * PUT /api/settings
 * Admin endpoint: updates one or more settings.
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Settings payload must be an object of key-value pairs',
    });
  }

  const updatedSettings = await settingService.updateSettings(updates);

  res.json({
    success: true,
    message: 'Store settings updated successfully and published to storefront.',
    data: updatedSettings,
  });
});

