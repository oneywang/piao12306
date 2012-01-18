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

#ifndef DOWNLOAD_HELPER_SCRIPT_OBJECT_H_
#define  DOWNLOAD_HELPER_SCRIPT_OBJECT_H_

#include <string>
#include "script_object_base.h"

class HelperScriptObject :public ScriptObjectBase {
protected:
  HelperScriptObject() {}
  virtual ~HelperScriptObject() {}

public:
  static NPObject* Allocate(NPP npp, NPClass *aClass);

  void InitHandler();

  void Deallocate();
  void Invalidate() {}
  bool Construct(const NPVariant *args,uint32_t argCount,
                 NPVariant *result) { return true; }

public:
  bool IsInstalled(const NPVariant *args, uint32_t argCount,
                    NPVariant *result);
  bool Install(const NPVariant *args, uint32_t argCount,
                    NPVariant *result);
};

#endif  /* HelperScriptObject_H */

