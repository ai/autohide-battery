import GLib from 'gi://GLib'
import UPower from 'gi://UPowerGlib'
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import { panel } from 'resource:///org/gnome/shell/ui/main.js'

export default class AutohideBatteryExtension extends Extension {
  batteryWatching = null

  initTimeout = null

  settings = null

  settingsWatching = null

  disable() {
    if (this.settings) {
      this.settings.disconnect(this.settingsWatching)
      this.settings = null
    }

    if (this.initTimeout) {
      GLib.Source.remove(this.initTimeout)
      this.initTimeout = null
    }

    this.getBattery(proxy => {
      proxy.disconnect(this.batteryWatching)
    })

    this.show()
  }

  enable() {
    this.settings = this.getSettings()
    this.settingsWatching = this.settings.connect('changed::hide-on', () => {
      this.update()
    })

    this.getBattery(proxy => {
      this.batteryWatching = proxy.connect('g-properties-changed', () => {
        this.update()
      })
    })

    this.update()
    this.initTimeout = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      1,
      () => {
        this.update()
        return GLib.SOURCE_CONTINUE
      }
    )
  }

  getBattery(callback) {
    let system = panel.statusArea.quickSettings._system
    if (system && system._systemItem._powerToggle) {
      callback(system._systemItem._powerToggle._proxy, system)
    }
  }

  hide() {
    this.getBattery((proxy, icon) => {
      icon.hide()
    })
  }

  show() {
    this.getBattery((proxy, icon) => {
      icon.show()
    })
  }

  update() {
    let hideOn = this.settings.get_int('hide-on')
    let hideAlways = this.settings.get_boolean('hide-always')

    this.getBattery(proxy => {
      let isPendingCharge = proxy.State === UPower.DeviceState.PENDING_CHARGE
      let isFullyCharged = proxy.State === UPower.DeviceState.FULLY_CHARGED
      let isDischarging = proxy.State === UPower.DeviceState.DISCHARGING

      if (proxy.Type !== UPower.DeviceKind.BATTERY) {
        this.show()
      } else if ((hideAlways || !isDischarging) && proxy.Percentage >= hideOn) {
        this.hide()
      } else if (isFullyCharged || isPendingCharge) {
        this.hide()
      } else {
        this.show()
      }
    })
  }
}
