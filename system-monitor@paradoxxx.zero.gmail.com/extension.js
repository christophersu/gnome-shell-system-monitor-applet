// system-monitor: Gnome shell extension displaying system informations in gnome shell status bar, such as memory usage, cpu usage, network rates…
// Copyright (C) 2011 Florian Mounier aka paradoxxxzero

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Author: Florian Mounier aka paradoxxxzero

const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Lang = imports.lang;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;

function SystemMonitor() {
    this._init.apply(this, arguments);
}

SystemMonitor.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init_menu: function() {
        let section = new PopupMenu.PopupMenuSection("Memory");
        let item = new PopupMenu.PopupMenuItem("Memory Usage:");
        this._mem = new St.Label();
        this._mem_total = new St.Label();
        item.addActor(this._mem);
        item.addActor(new St.Label({ text: "/"}));
        item.addActor(this._mem_total);
        section.addMenuItem(item);
        this.menu.addMenuItem(section);

        section = new PopupMenu.PopupMenuSection("Swap");
        item = new PopupMenu.PopupMenuItem("Swap Usage:");
        this._swap = new St.Label();
        this._swap_total = new St.Label();
        item.addActor(this._swap);
        item.addActor(new St.Label({ text: "/"}));
        item.addActor(this._swap_total);
        section.addMenuItem(item);
        this.menu.addMenuItem(section);
    },
    _init_status: function() {
        let box = new St.BoxLayout();
        let icon = new St.Icon({ icon_type: St.IconType.SYMBOLIC, icon_size: Main.panel.button.height - 4, icon_name:'utilities-system-monitor'});
        this._mem_ = new St.Label();
        this._swap_ = new St.Label();
        this._cpu_ = new St.Label();

        box.add_actor(icon);
        box.add_actor(this._mem_);
        box.add_actor(this._swap_);
        box.add_actor(this._cpu_);

        this.actor.set_child(box);
    },
    _init: function() {
	    Panel.__system_monitor = this;
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'utilities-system-monitor', 'System monitor');
        this._init_menu();
        this._init_status();

        GLib.timeout_add(0, 1000, function () {
            Panel.__system_monitor._update_mem_swap();
            return true;
        });
        GLib.timeout_add(0, 500, function () {
            Panel.__system_monitor._update_cpu();
            return true;
        });
    },

    _update_mem_swap: function() {
        this_ = Panel.__system_monitor;

        let free = GLib.spawn_command_line_sync('free -m');
        if(free[0]) {
            let free_lines = free[1].split("\n");

            let mem_params = free_lines[1].replace(/ +/g, " ").split(" ");
            let percentage = Math.round(mem_params[2]/mem_params[1]*100);
            this_._mem_.set_text(" " + percentage + "%");
            this_._mem.set_text(mem_params[2] + "M");
            this_._mem_total.set_text(mem_params[1] + "M");

            let swap_params = free_lines[3].replace(/ +/g, " ").split(" ");
            percentage = Math.round(swap_params[2]/swap_params[1]*100);
            this_._swap_.set_text(" " + percentage + "%");
            this_._swap.set_text(swap_params[2] + "M");
            this_._swap_total.set_text(swap_params[1] + "M");
        }
    },

    _update_cpu: function() {
        this_ = Panel.__system_monitor;

        let stat = GLib.spawn_command_line_sync('cat /proc/stats');
        if(stat[0]) {
            let stat_lines = stat[1].split("\n");

        }
    },

    _onDestroy: function() {}
};


function main() {
	Panel.STANDARD_TRAY_ICON_ORDER.unshift('system-monitor');
	Panel.STANDARD_TRAY_ICON_SHELL_IMPLEMENTATION['system-monitor'] = SystemMonitor;
}
