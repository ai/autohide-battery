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

    let row = new Adw.SpinRow({
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
    group.add(row)

    row.connect('changed', () => {
      settings.set_int('hide-on', row.get_value())
    })
    settings.connect('changed::hide-on', () => {
      row.set_value(settings.get_int('hide-on'))
    })
  }
}
