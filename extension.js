import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import { panel } from 'resource:///org/gnome/shell/ui/main.js'
import UPower from 'gi://UPowerGlib'
import GLib from 'gi://GLib'

export default class AutohideBatteryExtension extends Extension {
  batteryWatching = null

  settingsWatching = null

  initTimeout = null

  settings = null

  getBattery(callback) {
    if (panel.statusArea.quickSettings) {
      let system = panel.statusArea.quickSettings._system
      if (system._systemItem._powerToggle) {
        callback(system._systemItem._powerToggle._proxy, system)
      }
    } else {
      let menu = panel.statusArea.aggregateMenu
      if (menu && menu._power) {
        callback(menu._power._proxy, menu._power)
      }
    }
  }

  show() {
    this.getBattery((proxy, icon) => {
      icon.show()
    })
  }

  hide() {
    this.getBattery((proxy, icon) => {
      icon.hide()
    })
  }

  update() {
    let hideOn = this.settings.get_int('hide-on')
    this.getBattery(proxy => {
      let isDischarging = proxy.State === UPower.DeviceState.DISCHARGING
      let isFullyCharged = proxy.State === UPower.DeviceState.FULLY_CHARGED
      if (proxy.Type !== UPower.DeviceKind.BATTERY) {
        this.show()
      } else if (isFullyCharged) {
        this.hide()
      } else if (proxy.Percentage >= hideOn && !isDischarging) {
        this.hide()
      } else {
        this.show()
      }
    })
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
}
