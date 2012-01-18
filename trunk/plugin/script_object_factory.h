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

#ifndef SCRIPT_OBJECT_FACTORY_H_
#define SCRIPT_OBJECT_FACTORY_H_

#include "script_object_base.h"

class ScriptObjectFactory {
private:
  ScriptObjectFactory(void);
  ~ScriptObjectFactory(void);

public:
  static ScriptObjectBase* CreateObject(NPP npp,
                                        NPAllocateFunctionPtr allocate);

};

#endif