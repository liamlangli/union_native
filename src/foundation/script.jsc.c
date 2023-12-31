#include "foundation/script.h"

#if defined(SCRIPT_BACKEND_JAVASCRIPTCORE)
#include <JavaScriptCore/JavaScriptCore.h>

static JSContextRef context;
static JSObjectRef global_object;

#endif

