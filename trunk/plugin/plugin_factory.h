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
#ifndef PLUGIN_FACTORY_H_
#define PLUGIN_FACTORY_H_

#include <map>
#include "plugin_base.h"
#include <string>

typedef PluginBase* (*ConstructorPtr)();

class PluginFactory {
private:
  PluginFactory(void);
  ~PluginFactory(void);

public:
  static void Init();
  static PluginBase* NewPlugin(NPMIMEType pluginType);

public:
  struct Plugin_Type_Item {
    std::string mime_type;
    ConstructorPtr constructor;
  };

  typedef std::map<std::string, Plugin_Type_Item> PluginTypeMap;

private:
  static PluginTypeMap plugin_type_map_;
};

#endif