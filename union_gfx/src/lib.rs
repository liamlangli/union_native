
use rusty_v8 as v8;

pub struct NativeDevice<'s> {
    context: v8::Local<'s, v8::Context>,
    context_scope: v8::ContextScope<'static, v8::HandleScope<'static>>
}

pub trait Device {
    fn version(&self) -> &str;
}

impl<'s> NativeDevice<'static>
{
    pub fn new(
        isolate_scope: &'s mut v8::HandleScope<'s, ()>,
    ) -> Self {
        let context = v8::Context::new(isolate_scope);
        let context_scope = v8::ContextScope::new(isolate_scope, context);

        let self_ = NativeDevice{
            context,
            context_scope
        };
        return self_
    }
}

impl<'s> Device
for NativeDevice<'s> {
    fn version(&self) -> &str {
        "0.0.1"
    }
}

