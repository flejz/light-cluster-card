import '@babel/polyfill';

import { LitElement, html } from 'lit-element';
import style from './style';

import { getEntityById } from './utils'
import defaultConfig from './defaults';
import LightEntityCardEditor from './index-editor';
import packageJson from '../package.json';

const editorName = 'light-cluster-card-editor';
customElements.define(editorName, LightEntityCardEditor);

class LightEntityCard extends LitElement {
  async firstUpdated() {
    if (window.loadCardHelpers) {
      const helpers = await window.loadCardHelpers();
      helpers.importMoreInfoControl('light');
    }
  }

  static get properties() {
    return {
      hass: Object,
      config: Object,
    };
  }

  setConfig(config) {
    if (!config.entities) throw Error('entity id list required.');

    this.config = {
      ...defaultConfig,
      ...config,
    };
  }

  static async getConfigElement() {
    return document.createElement(editorName);
  }

  static get featureNames() {
    return {
      brightness: 1,
      colorTemp: 2,
      effectList: 4,
    };
  }

  static get cmdToggle() {
    return {
      on: 'turn_on',
      off: 'turn_off',
    };
  }

  static get entityLength() {
    return {
      light: 10,
      switch: 1,
    };
  }

  getCardSize() {
    if (!this.config || !this.__hass) return 1;
    return parseInt(LightEntityCard.entityLength.light, 1);
  }

  get styles() {
    return style;
  }

  get language() {
    return this.__hass.resources[this.__hass.language];
  }

  get entities() {
    const { entities } = this.config
    return entities.map(eid => this.__hass.states[eid]) 
  }

  isEntityOn(e) {
    return e && e.state === 'on';
  }

  areEntitiesOn() {
    return this.entities.every(this.isEntityOn);
  }

  getEntitiesOn() {
    return this.entities.filter(this.isEntityOn);
  }

  updated() {
    this._isUpdating = false;
  }

  render() {
    console.log('### here', this.config)
    const entities = this.config.entities
      .map(eid => getEntityById(this.__hass.states, eid))
      .filter(Boolean);

    if (!entities || !entities.length) {
      throw Error(`Invalid entity list: ${this.config.entities.join(', ')}`);
    }

    this._isUpdating = true;

    const css = `light-cluster-card ${this.config.shorten_cards ? ' group' : ''} ${
      this.config.child_card ? ' light-entity-child-card' : ''
    }`;

    return html`
      <style>
        ${this.styles}
      </style>
      <ha-card class="${css}">
        <more-info-light .hass=${this.hass}></more-info-light>
        ${this.createEntityTemplate(entities)}
      </ha-card>
    `;
  }

  getAttributeList(entities, attr) {
    const attrs = entities.reduce((set, e) => {
      e.attributes[attr].forEach((i) => set.add(i));
      return set;
    }, new Set());

    return Array.from(attrs);
  }

  getMinValue(entities, attr) {
    return entities.reduce((n, e) => n === -1 || e.attributes[attr] < n ? e.attributes[attr] : n, -1);
  }

  /**
   * creates an entity's template
   * @param {LightEntity} entities
   * @return {TemplateResult}
   */
  createEntityTemplate(entities) {
    const sliderClass = this.config.full_width_sliders ? 'ha-slider-full-width' : '';

    return html`
      ${this.createHeader(entities)}
      <div class="light-cluster-card-sliders ${sliderClass}">
        ${this.createBrightnessSlider(entities)}
        ${this.createColorTemperature(entities)}
      </div>
      ${this.createEffectList(entities)}
    `;
  }

  /**
   * creates card header with state toggle for a given entity
   * @param {LightEntity} entities
   * @return {TemplateResult}
   */
  createHeader(entities) {
    if (this.config.hide_header) return html``;

    return html`
      <div class="light-cluster-card__header">
        <div class="light-cluster-card__title">${this.config.header}</div>
        <div class="light-cluster-card-toggle">
          <ha-switch .checked=${this.areEntitiesOn()} @change=${e => this.setToggle(e, entities)}></ha-switch>
        </div>
      </div>
    `;
  }

  /**
   * creates brightness slider
   * @param {LightEntity} entities
   * @return {TemplateResult}
   */
  createBrightnessSlider(entities) {
    if (!this.config.brightness) return html``;

    return html`
      <div class="control light-cluster-card-center">
        <div class="icon-container">
          <ha-icon icon="hass:${this.config.brightness_icon}"></ha-icon>
        </div>
        <ha-slider
          .value="${this.getMinValue(entities, 'brightness')}"
          @value-changed="${event => this._setValue(event, entities, 'brightness')}"
          min="1"
          max="255"
        ></ha-slider>
        ${this.showPercent(this.getMinValue(entities, 'brightness'), 0, 254)}
      </div>
    `;
  }

  /**
   * shows slider percent if config is set
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {TemplateResult}
   */
  showPercent(value, min, max) {
    if (!this.config.show_slider_percent) return html``;
    let percent = parseInt(((value - min) * 100) / (max - min), 0);
    if (isNaN(percent)) percent = 0;

    return html` <div class="percent-slider">${percent}%</div> `;
  }

  /**
   * creates color temperature slider for a given entity
   * @param {LightEntity} entities
   * @return {TemplateResult}
   */
  createColorTemperature(entities) {
    if (!this.config.color_temp) return html``;

    const colorTemp = this.getMinValue(entities, 'color_temp');
    const min = this.getMinValue(entities, 'min_mireds');
    const max = this.getMinValue(entities, 'max_mireds');

    const percent = this.showPercent(
      colorTemp,
      min - 1,
      max - 1
    );

    return html`
      <div class="control light-cluster-card-center">
        <ha-icon icon="hass:${this.config.temperature_icon}"></ha-icon>
        <ha-slider
          class="light-cluster-card-color_temp"
          min="${min}"
          max="${max}"
          .value=${colorTemp}
          @value-changed="${event => this._setValue(event, entities, 'color_temp')}"
        >
        </ha-slider>
        ${percent}
      </div>
    `;
  }

  createEffectList(entities) {
    if (!this.config.effects_list) return html``;

    let effectList = this.getAttributeList(entities, 'effect_list') || [];

    if (this.config.effects_list && Array.isArray(this.config.effects_list)) {
      effectList = this.config.effects_list;
    } else if (this.config.effects_list && this.hass.states[this.config.effects_list]) {
      const inputSelect = this.hass.states[this.config.effects_list];
      effectList = (inputSelect.attributes && inputSelect.attributes.options) || [];
    } 

    const listItems = effectList.map(effect => html`<paper-item>${effect}</paper-item>`);
    const selectedIndex = entities.length ? effectList.indexOf(entities[0].attributes.effect) : -1;
    const caption = this.language['ui.card.light.effect'];

    return html`
      <div class="control light-cluster-card-center light-cluster-card-effectlist">
        <paper-dropdown-menu @value-changed=${e => this.setEffect(e, entities)} label="${caption}">
          <paper-listbox selected="${selectedIndex}" slot="dropdown-content" placeholder="${caption}">
            ${listItems}
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
    `;
  }


  _setValue(event, entities, valueName) {
    const newValue = parseInt(event.target.value, 0);
    if (isNaN(newValue)) return;
    this.callEntityService({ [valueName]: newValue }, this.getEntitiesOn());
  }

  /**
   * sets the toggle state based on the given entity state
   * @param {CustomEvent} event
   * @param {LightEntity} entities
   */
  setToggle(event, entities) {
    const newState = this.areEntitiesOn() ? LightEntityCard.cmdToggle.off : LightEntityCard.cmdToggle.on;
    this.callEntityService({}, entities, newState);
  }

  /**
   * sets the current effect selected for an entity
   * @param {CustomEvent} event
   * @param {LightEntity} entity
   */
  setEffect(event, entities) {
    this.callEntityService({ effect: event.detail.value }, this.getEntitiesOn());
  }

  /**
   * call light service to update a state of an entity
   * @param {Object} payload
   * @param {LightEntity} entity
   * @param {String} state
   */
  callEntityService(payload, entities, state) {
    if (this._isUpdating) return;

    entities.forEach((e) => {
      let [entityType] = e.entity_id.split('.');
      this.hass.callService(entityType, state || LightEntityCard.cmdToggle.on, {
        entity_id: e.entity_id,
        ...payload,
      });
    });
  }
}

customElements.define('light-cluster-card', LightEntityCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'light-cluster-card',
  name: 'Light Cluster Card',
  description: 'Control lights and switches',
});
