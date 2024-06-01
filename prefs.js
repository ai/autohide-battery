import Adw from 'gi://Adw'
import Gtk from 'gi://Gtk'
import {
  gettext as _,
  ExtensionPreferences
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

export default class AutohideBatteryPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    let settings = this.getSettings()
    window._settings = settings

    let page = new Adw.PreferencesPage()
    window.add(page)

    let group = new Adw.PreferencesGroup()
    page.add(group)

    let level = new Adw.SpinRow({
      adjustment: new Gtk.Adjustment({
        'lower': 0,
        'step-increment': 1,
        'upper': 100,
        'value': settings.get_int('hide-on')
      }),
      subtitle: _(
        'If you changed maximum charging level to extend battery life'
      ),
      title: _('Hide on battery level above')
    })
    group.add(level)

    level.connect('changed', () => {
      settings.set_int('hide-on', level.get_value())
    })
    settings.connect('changed::hide-on', () => {
      level.set_value(settings.get_int('hide-on'))
    })

    let always = new Adw.SwitchRow({
      active: settings.get_boolean('hide-always'),
      subtitle: _(
        'For laptops often jumping between charging and discharging'
      ),
      title: _('Hide battery even on discharge if the level is above')
    })
    group.add(always)

    always.connect('notify::active', () => {
      settings.set_boolean('hide-always', always.get_active())
    })
    settings.connect('changed::hide-always', () => {
      always.set_active(settings.get_boolean('hide-always'))
    })
  }
}
