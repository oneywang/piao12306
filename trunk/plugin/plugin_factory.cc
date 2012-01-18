/*
 *  12306 Booking Helper Extension for Google Chrome and Chrome-base browsers such as 360chrome.
 *  Copyright (C) 2012 Landman
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */
#include "stdafx.h"

#include "helper_plugin.h"
#include "plugin_factory.h"

PluginFactory::PluginTypeMap PluginFactory::plugin_type_map_;

void PluginFactory::Init() {
  Plugin_Type_Item item;
  item.mime_type = kMIMEType;
  item.constructor = &HelperPlugin::CreateObject;
  plugin_type_map_.insert(PluginTypeMap::value_type(item.mime_type, item));
}

PluginBase* PluginFactory::NewPlugin(NPMIMEType pluginType) {
  PluginBase* plugin = NULL;
  PluginTypeMap::iterator iter = plugin_type_map_.find(pluginType);
  if (iter != plugin_type_map_.end()) {
    plugin = iter->second.constructor();
  }

  return plugin;
}
