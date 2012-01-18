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

#ifndef SCRIPT_OBJECT_BASE_H_
#define SCRIPT_OBJECT_BASE_H_

#include <map>
#include <string>

#include "npapi.h"
#include "npruntime.h"
#include "plugin_base.h"

#include "utils.h"

class ScriptObjectBase : public NPObject {
public:
  ScriptObjectBase(void) {}
  virtual ~ScriptObjectBase(void) {}

  typedef bool (ScriptObjectBase::*InvokePtr)(const NPVariant *args,
                                              uint32_t argCount,
                                              NPVariant *result);

  struct Function_Item {
    std::string function_name;
    InvokePtr function_pointer;
  };

  struct Property_Item {
    std::string property_name;
    NPVariant value;
  };

  virtual void Deallocate() = 0;
  virtual void Invalidate() = 0;
  virtual bool HasMethod(NPIdentifier name)  {
    bool ret = false;
    utils::IdentifiertoString method_name(name);
    if (method_name.identifier_name()) {
      FunctionMap::iterator iter = function_map_.find((const char*)method_name);
      ret = iter != function_map_.end();
    }
    return ret;
  }

  virtual bool Invoke(NPIdentifier name, const NPVariant *args,
    uint32_t argCount, NPVariant *result)  {
    bool ret = false;
    utils::IdentifiertoString method_name(name);
    if (method_name.identifier_name()) {
      FunctionMap::iterator iter = function_map_.find((const char*)method_name);
      if (iter != function_map_.end())
        ret = (this->*(iter->second.function_pointer))(args, argCount, result);
    }
    return ret;
  }

  virtual bool InvokeDefault(const NPVariant *args, uint32_t argCount,
                             NPVariant *result) { return false; }

  virtual bool HasProperty(NPIdentifier name)  {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
      PropertyMap::iterator iter = property_map_.find((const char*)property_name);
      ret = iter != property_map_.end();
    }
    return ret;
  }

  virtual bool GetProperty(NPIdentifier name, NPVariant *result)  {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
      PropertyMap::iterator iter = property_map_.find((const char*)property_name);
      if (iter != property_map_.end()) {
        *result = iter->second.value;
        ret = true;
      }
    }
    return ret;
  }

  virtual bool SetProperty(NPIdentifier name, const NPVariant *value)  {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
      PropertyMap::iterator iter = property_map_.find((const char*)property_name);
      if (iter != property_map_.end()) {
        iter->second.value = *value;
        ret = true;
      }
    }
    return ret;
  }

  virtual bool RemoveProperty(NPIdentifier name)  {
    bool ret = false;
    utils::IdentifiertoString property_name(name);
    if (property_name.identifier_name()) {
      PropertyMap::iterator iter = property_map_.find((const char*)property_name);
      if (iter != property_map_.end()) {
        property_map_.erase(iter);
        ret = true;
      }
    }
    return ret;
  }

  virtual bool Enumerate(NPIdentifier **value, uint32_t *count) { return false; }

  virtual bool Construct(const NPVariant *args, uint32_t argCount,
                         NPVariant *result) = 0;
  
  virtual void InitHandler() {}

protected:
  void AddProperty(Property_Item& item)  {
    PropertyMap::iterator iter = property_map_.find(item.property_name);
    if (iter != property_map_.end())
      return;

    property_map_.insert(PropertyMap::value_type(item.property_name, item));
  }

  void AddFunction(Function_Item& item)  {
    FunctionMap::iterator iter = function_map_.find(item.function_name);
    if (iter != function_map_.end())
      return;

    function_map_.insert(FunctionMap::value_type(item.function_name, item));
  }

  void set_plugin(PluginBase* plug) { plugin_ = plug; }

  PluginBase* get_plugin() { return plugin_; }

private:
  typedef std::map<std::string, Function_Item> FunctionMap;
  typedef std::map<std::string, Property_Item> PropertyMap;
  FunctionMap function_map_;
  PropertyMap property_map_;
  PluginBase* plugin_;

};

#define ON_INVOKEHELPER(_funPtr) \
  static_cast<bool (ScriptObjectBase::*)(const NPVariant *,uint32_t , \
                                         NPVariant *)>(_funPtr)

#endif