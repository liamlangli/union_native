
use rusty_v8 as v8;
use std::fs;

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

pub fn run_script(path: &str) {
    let platform = v8::new_default_platform(0, false).make_shared();
    v8::V8::initialize_platform(platform);
    v8::V8::initialize();

    // Create a new Isolate and make it the current one.
    let isolate = &mut v8::Isolate::new(v8::CreateParams::default());
    // Create a stack-allocated handle scope.
    let handle_scope = &mut v8::HandleScope::new(isolate);

    // Create a new context.
    let context = v8::Context::new(handle_scope);

    // Enter the context for compiling and running the hello world script.
    let scope = &mut v8::ContextScope::new(handle_scope, context);

    let source = fs::read_to_string(path).unwrap();

    let code = v8::String::new(scope, source.as_str()).unwrap();

    let script = v8::Script::compile(scope, code, None).unwrap();

    let result = script.run(scope).unwrap();

    println!("{}", result.to_string(scope).unwrap().to_rust_string_lossy(scope));
}
