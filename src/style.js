import { css } from 'lit-element';

const style = css`
  .light-cluster-card {
    padding: 16px;
  }

  .light-entity-child-card {
    box-shadow: none !important;
    padding: 0 !important;
  }

  .light-cluster-card.group {
    padding-bottom: 0;
    padding-top: 0;
  }

  .ha-slider-full-width ha-slider {
    width: 100%;
  }

  .percent-slider {
    color: var(--primary-text-color);
    margin-top: 5px;
  }

  .light-cluster-card__header {
    display: flex;
    justify-content: space-between;
    @apply --paper-font-headline;
    line-height: 40px;
    color: var(--primary-text-color);
    font-size: 24px;
  }

  .group .light-cluster-card__header {
    font-size: 16px;
  }

  .light-cluster-card-sliders > div {
    margin-top: 10px;
  }

  .group .light-cluster-card-sliders > div {
    margin-top: 0px;
  }

  .light-cluster-card__toggle {
    display: flex;
    cursor: pointer;
  }

  .light-cluster-card__color-picker {
    display: flex;
    justify-content: space-around;
    --ha-color-picker-wheel-borderwidth: 5;
    --ha-color-picker-wheel-bordercolor: white;
    --ha-color-picker-wheel-shadow: none;
    --ha-color-picker-marker-borderwidth: 2;
    --ha-color-picker-marker-bordercolor: white;
  }

  .group .light-cluster-card__color-picker {
    width: 50%;
    margin: 0 auto;
  }

  ha-labeled-slider {
    --paper-slider-input: {
      width: 100%;
    }
  }

  .light-cluster-card-color_temp {
    background-image: var(--ha-slider-background);
  }

  .group .light-cluster-card-effectlist {
    margin-top: -25px;
  }

  .light-cluster-card-center {
    display: flex;
    justify-content: center;
    cursor: pointer;
  }

  .light-cluster-card-toggle {
    margin-right: 5px;
  }

  .hidden {
    display: none;
  }

  .icon-container {
    margin-top: 4px;
  }
`;

export default style;
