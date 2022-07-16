
use rusty_v8 as v8;

pub struct NativeDevice<'s, 'i> {
    pub context: v8::Local<'s, v8::Context>,
    pub context_scope: v8::ContextScope<'i, v8::HandleScope<'s>>
}

pub trait Device {
    fn version(&self) -> &str;
}

impl<'s, 'i> NativeDevice<'s, 'i>
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

impl<'s, 'i> Device
for NativeDevice<'s, 'i> {
    fn version(&self) -> &str {
        "0.0.1"
    }
}

