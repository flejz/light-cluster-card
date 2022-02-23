import { LitElement, html } from 'lit-element';
import style from './style-editor';
import defaultConfig from './defaults';
import { getEntityName, getEntityByName } from './utils'

export const fireEvent = (node, type, detail = {}, options = {}) => {
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });

  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

export default class LightEntityCardEditor extends LitElement {
  static get styles() {
    return style;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }

  firstUpdated() {
    this.firstRendered = true;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    // get header name
    const { states }= this.hass;
    let { entityIds, header } = this.config;
    if (!header && this.config.entity) {
      let name = this.config.entity.split('.')[1] || '';
      if (name) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        header = name;
      }
    }

    const entities = Object
      .values(states)
      .filter(e => /^light\./.test(e.entity_id))

    const entityCheckboxes = entities
      .map((e, i) => html`
        <div class='checkbox-options'>
          <ha-formfield label="${getEntityName(e)}">
            <ha-checkbox
              @change="${this.entitiesConfigChanged}"
              .checked=${entityIds.indexOf(e.entity_id) > -1}
              .value="${e.entity_id}"
            ></ha-checkbox>
          </ha-formfield>
        </div>
      `);

    return html`
      <div class="card-config">

        <div class=overall-config'>
          <paper-input
            label="Header"
            .value="${header}"
            .configValue="${'header'}"
            @value-changed="${this.configChanged}"
          ></paper-input>
        </div>

        <div class='entities'>
          <paper-input
            label="Brightness Icon"
            .value="${this.config.brightness_icon}"
            .configValue="${'brightness_icon'}"
            @value-changed="${this.configChanged}"
          ></paper-input>
          <paper-input
            label="Temperature Icon"
            .value="${this.config.temperature_icon}"
            .configValue="${'temperature_icon'}"
            @value-changed="${this.configChanged}"
          ></paper-input>
        </div>

        <h3>Entities</h3>
        ${entityCheckboxes}

        <h3>Extra options</h3>
        <div class='overall-config'>
            <div class='checkbox-options'>
              <ha-formfield label="Show Brightness">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.brightness}
                  .value="${'brightness'}"
                ></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="Show Color Temp">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.color_temp}
                  .value="${'color_temp'}"
                ></ha-checkbox>
              </ha-formfield>
            </div>

            <div class='checkbox-options'>
              <ha-formfield label="Show Effects List">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.effects_list}
                  .value="${'effects_list'}"
                ></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="Hide Header">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.hide_header}
                  .value="${'hide_header'}"
                ></ha-checkbox>
              </ha-formfield>
            </div>

            <div class='checkbox-options'>
              <ha-formfield label="Full Width Sliders">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.full_width_sliders}
                  .value="${'full_width_sliders'}"
                ></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="Show Slider Percent">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.show_slider_percent}
                  .value="${'show_slider_percent'}"
                ></ha-checkbox>
              </ha-formfield>
            </div>

            <div class='checkbox-options'>
              <ha-formfield label="Child Card">
                <ha-checkbox
                  @change="${this.checkboxConfigChanged}"
                  .checked=${this.config.child_card}
                  .value="${'child_card'}"
                ></ha-checkbox>
              </ha-formfield>
            </div>

          </div>
      </div>
    `;
  }

  configChanged(ev) {
    if (!this.config || !this.hass || !this.firstRendered) return;
    const {
      target: { configValue, value },
      detail: { value: checkedValue },
    } = ev;

    if (checkedValue !== undefined || checkedValue !== null) {
      this.config = { ...this.config, [configValue]: checkedValue };
    } else {
      this.config = { ...this.config, [configValue]: value };
    }

    fireEvent(this, 'config-changed', { config: this.config });
  }

  entitiesConfigChanged(ev) {
    if (!this.config || !this.hass || !this.firstRendered) return;
    const {
      target: { value, checked },
    } = ev;

    let entityIds = [...this.config.entityIds];

    if (checked) {
      entityIds = [...entityIds, value];
    } else {
      entityIds.splice(entityIds.indexOf(value), 1)
    }

    this.config = { ...this.config, entityIds };
    fireEvent(this, 'config-changed', { config: this.config });
  }

  checkboxConfigChanged(ev) {
    if (!this.config || !this.hass || !this.firstRendered) return;
    const {
      target: { value, checked },
    } = ev;

    this.config = { ...this.config, [value]: checked };

    fireEvent(this, 'config-changed', { config: this.config });
  }
}
