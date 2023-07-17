import { Overlay } from 'ol';

let tooltip;
let tooltipOverlay;
let measureTooltip;
let measureTooltipOverlay;

function getTooltipOverlay() {
  if (tooltip && tooltip.parentNode) {
    tooltip.parentNode.removeChild(tooltip);
  }
  tooltip = document.createElement('div');
  tooltip.className = 'ol-tooltip hidden';
  tooltipOverlay = new Overlay({
    element: tooltip,
    offset: [15, 0],
    positioning: 'center-left',
  });
  return tooltipOverlay;
}

function getMeasureTooltipOverlay() {
  if (measureTooltip && measureTooltip.parentNode) {
    measureTooltip.parentNode.removeChild(measureTooltip);
  }
  measureTooltip = document.createElement('div');
  measureTooltip.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltipOverlay = new Overlay({
    element: measureTooltip,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  return measureTooltipOverlay;
}

function resetMeasureTooltip() {
  measureTooltip.className = 'ol-tooltip ol-tooltip-static';
  measureTooltipOverlay.setOffset([0, -7]);
  measureTooltip = null;
}

function resetTooltip() {
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip);
  }
  if (measureTooltip) {
    measureTooltip.parentNode.removeChild(measureTooltip);
  }
}

export {
  tooltip,
  tooltipOverlay,
  measureTooltip,
  measureTooltipOverlay,
  getTooltipOverlay,
  getMeasureTooltipOverlay,
  resetMeasureTooltip,
  resetTooltip,
};
