export type PolyHavenTextureSelection = {
  assetId: string;
  name: string;
  localSrc: string;
  thumbnailUrl: string;
  filesHash: string;
  resolution: "2k";
  mapType: "Diffuse";
  format: "jpg";
  sourceUrl: string;
  authors: string[];
};

export type PolyHavenTextureSummary = {
  assetId: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  filesHash: string;
  authors: string[];
  downloadCount: number;
};
