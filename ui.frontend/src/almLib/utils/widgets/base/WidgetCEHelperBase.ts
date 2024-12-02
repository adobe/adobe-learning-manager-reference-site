import { Widget, WidgetType } from "../common";
// import {TemplateResult} from 'lit-element';
import { GetTranslation } from "../../translationService";

export interface IWidgetCEDimensionRequirements {
  minWidth: number;
  maxWidth: number;
  widthIncrements: number;
  fluidWidth: boolean /* determines if row occupies fully or boxed. disallowMerge should be true first */;
  minHeight: number;
  maxHeight: number;
  heightIncrements: number;
  disallowMerge?: boolean /* determines if row can be shared with other widgets */;
  headerHeight?: number;
}

export function GetFixedDimensionRequirements(
  fixedWidth: number,
  fixedHeight: number
): IWidgetCEDimensionRequirements {
  return {
    minWidth: fixedWidth,
    maxWidth: fixedWidth,
    widthIncrements: 0,
    fluidWidth: false,
    minHeight: fixedHeight,
    maxHeight: fixedHeight,
    heightIncrements: 0,
  };
}
export function GetFixedHeightDimensionRequirements(
  minWidth: number,
  widthIncrements: number,
  fluidWidth: boolean,
  fixedHeight: number,
  maxWidth?: number
): IWidgetCEDimensionRequirements {
  maxWidth = maxWidth || Number.POSITIVE_INFINITY;
  return {
    minWidth: minWidth,
    maxWidth: maxWidth,
    widthIncrements: widthIncrements,
    fluidWidth: fluidWidth,
    minHeight: fixedHeight,
    maxHeight: fixedHeight,
    heightIncrements: 0,
  };
}
export function GetFixedWidthDimensionRequirements(
  fixedWidth: number,
  minHeight: number,
  heightIncrements: number,
  maxHeight?: number
): IWidgetCEDimensionRequirements {
  maxHeight = maxHeight || Number.POSITIVE_INFINITY;
  return {
    minWidth: fixedWidth,
    maxWidth: fixedWidth,
    widthIncrements: 0,
    fluidWidth: false,
    minHeight: minHeight,
    maxHeight: maxHeight,
    heightIncrements: heightIncrements,
  };
}
export function GetDynamicWidthHeightDimensionRequirements(
  minWidth?: number,
  widthIncrements?: number,
  minHeight?: number,
  heightIncrements?: number
): IWidgetCEDimensionRequirements {
  minWidth = minWidth || 0;
  minHeight = minHeight || 0;
  widthIncrements = widthIncrements || 1;
  heightIncrements = heightIncrements || 1;
  return {
    minWidth: 0,
    maxWidth: Number.POSITIVE_INFINITY,
    widthIncrements: 1,
    fluidWidth: true,
    minHeight: 0,
    maxHeight: Number.POSITIVE_INFINITY,
    heightIncrements: heightIncrements,
  };
}

export abstract class WidgetCEHelperBase {
  constructor(
    protected _customElementName: string,
    protected _widgetType: WidgetType,
    protected _dimensions: IWidgetCEDimensionRequirements,
    protected _skipLinkMsg: string = ""
  ) {}

  public customElementName(): string {
    return this._customElementName;
  }
  public widgetType(): WidgetType {
    return this._widgetType;
  }
  public canInit(widget: Widget): boolean {
    if (widget && widget.layoutAttributes) {
      if (widget.layoutAttributes.canInit !== undefined) {
        return widget.layoutAttributes.canInit;
      }
    }
    return true;
  }
  public getTranslatedSkipLinkMsg() {
    return this._skipLinkMsg ? GetTranslation(this._skipLinkMsg) || this._skipLinkMsg : "";
  }
  public getDimensionDetails(_widget: Widget): IWidgetCEDimensionRequirements {
    // _widget;
    return this._dimensions;
  }
  public minCards(): number {
    return 1;
  }
  public maxCards(): number {
    return -1;
  }
  public isFullRow(): boolean {
    return false;
  }
  /**Only if its a full row widget, this is considered */
  public needTopPaddingWhenFullRow(): boolean {
    return true;
  }
  public abstract getHTML(widget: Widget, otherInfo?: any): any;
}
