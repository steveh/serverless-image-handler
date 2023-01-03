import { ImageEdits, ImageFormatTypes } from './lib';

export const IIIFMatch = /^(?<prefix>[\w_\-\/]+)\/(?<identifier>[\w~%_\-\.]+)\/(?<region>[\w!,:]+)\/(?<size>[\w!,:]+)\/(?<rotation>[\w!]+)\/(?<quality>[\w]+)\.(?<format>[\w]+)$/i;

export class IIIFMapper {
  sizeRegex = /^!(\d+),(\d+)$/

  acceptedFormats = [
    ImageFormatTypes.HEIC,
    ImageFormatTypes.HEIF,
    ImageFormatTypes.JPEG,
    ImageFormatTypes.PNG,
    ImageFormatTypes.RAW,
    ImageFormatTypes.TIFF,
    ImageFormatTypes.WEBP
  ];

  /**
   * Initializer function for creating a new IIIF mapping, used by the image
   * handler to perform image modifications based on IIIF URL path requests.
   * @param path The request path.
   * @returns Image edits based on the request path.
   */
  public mapPathToEdits(path: string): ImageEdits {
    const match = IIIFMatch.exec(path);
    const { format, quality, rotation, region, size } = match.groups;

    const edits: ImageEdits = {};

    const imageFormatType = format.replace(/jpg/i, 'jpeg') as ImageFormatTypes;
    if (!this.acceptedFormats.includes(imageFormatType)) {
      throw new Error('IIIFMapping::Format::Unsupported');
    }

    edits.toFormat = imageFormatType;

    if (quality !== 'default') {
      const qualityN = parseInt(quality, 10);
      if (isNaN(qualityN)) {
        throw new Error('IIIFMapping::Quality::NaN');
      }

      edits.quality = qualityN;
    }

    if (rotation !== '0') {
      const rotationN = parseInt(rotation, 10);
      if (isNaN(rotationN)) {
        throw new Error('IIIFMapping::Rotation::NaN');
      }

      edits.rotate = rotationN;
    }

    if (region !== 'full') {
      throw new Error('IIIFMapping::Region::Unsupported');
    }

    if (size !== 'full') {
      const sizeMatch = this.sizeRegex.exec(size);
      if (!sizeMatch) {
        throw new Error('IIIFMapping::Size::Unsupported');
      }

      const width = parseInt(sizeMatch[1], 10)
      const height = parseInt(sizeMatch[2], 10)

      edits.resize = { width, height }
    }

    return edits;
  }
}
