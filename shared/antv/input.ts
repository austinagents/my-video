import type {StudioBlock} from "../project";
import {resolveAntVBlock} from "./resolve";
import {buildAntVSyntax} from "./syntax";

export type AntVRenderInput = {
  template: string;
  syntax: string;
  padding: number;
  width: number;
  height: number;
};

export const resolveAntVRenderInput = (
  block: StudioBlock,
): AntVRenderInput => {
  const resolved = resolveAntVBlock(block);

  return {
    template: resolved.template,
    syntax: buildAntVSyntax(block, resolved.template),
    padding: resolved.padding,
    width: resolved.internalWidth,
    height: resolved.internalHeight,
  };
};
