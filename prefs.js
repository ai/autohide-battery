import Gtk from 'gi://Gtk'
import {
  gettext as _,
  ExtensionPreferences
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

export default class AutohideBatteryPreferences extends ExtensionPreferences {
  fillPreferencesWindow() {
    let settings = this.getSettings()

    let grid = new Gtk.Grid({
      column_spacing: 24,
      halign: Gtk.Align.CENTER,
      margin_bottom: 24,
      margin_end: 24,
      margin_start: 24,
      margin_top: 24,
      row_spacing: 12
    })

    let label = new Gtk.Label({
      halign: Gtk.Align.START,
      label: _('Hide on battery level above')
    })
    grid.attach(label, 0, 0, 1, 1)

    let field = new Gtk.SpinButton()
    field.set_range(0, 100)
    field.set_sensitive(true)
    field.set_increments(1, 10)
    grid.attach(field, 1, 0, 1, 1)

    let note = new Gtk.Label({
      halign: Gtk.Align.CENTER,
      label: _('If you changed maximum charging level to extend battery life')
    })
    note.get_style_context().add_class('dim-label')
    grid.attach(note, 0, 1, 2, 1)

    field.set_value(settings.get_int('hide-on'))
    field.connect('value-changed', widget => {
      settings.set_int('hide-on', widget.get_value_as_int())
    })
    settings.connect('changed::hide-on', () => {
      field.set_value(settings.get_int('hide-on'))
    })
    return grid
  }
}
