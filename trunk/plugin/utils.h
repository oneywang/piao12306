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

#ifndef UTIL_H_
#define UTIL_H_

#include "npfunctions.h"

namespace utils {
  class IdentifiertoString {
  public:
    explicit IdentifiertoString(NPIdentifier identifier)
      : identifier_name_(NULL) {
        identifier_name_ = NPN_UTF8FromIdentifier(identifier);
    }
    const char* identifier_name() const { return identifier_name_; }
    operator const char*() const { return identifier_name_; }
    ~IdentifiertoString() { if (identifier_name_) NPN_MemFree(identifier_name_); }

  private:
    // Disable evil constructors.
    IdentifiertoString();
    IdentifiertoString(const IdentifiertoString&);

    char* identifier_name_;
  };

   string unicode2utf8(wstring const& ws);

  wstring utf82unicode(string const& s);

  wstring string2wstring(string const& p);

  string& ReplaceAllDistinct(string& str, string const& old_value, string const& new_value);

  wstring GetExePathFromHWnd(HWND HWnd);
}

#endif