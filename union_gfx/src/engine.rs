use rusty_v8 as v8;
use std::fs;

pub struct ScriptEngine<'s, 'i> {
    pub context: v8::Local<'s, v8::Context>,
    pub context_scope: v8::ContextScope<'i, v8::HandleScope<'s>>
}

impl<'s, 'i> ScriptEngine<'s, 'i>
{
    pub fn new(
        isolate_scope: &'i mut v8::HandleScope<'s, ()>,
    ) -> Self {
        let global = v8::ObjectTemplate::new(isolate_scope);
        // global.set(v8::String::new(isolate_scope, "create_device").unwrap().into(),
            v8::FunctionTemplate::new(isolate_scope, create_device).into());

        let context = v8::Context::new_from_template(isolate_scope, global);
        let context_scope = v8::ContextScope::new(isolate_scope, context);

        let self_ = ScriptEngine{
            context,
            context_scope
        };
        return self_
    }

    pub fn run_script(&mut self, path: &str) {
        let scope = &mut v8::HandleScope::new(&mut self.context_scope);
        let source = fs::read_to_string(path).unwrap();
        let code = v8::String::new(scope, source.as_str()).expect("code compile error");
        let script = v8::Script::compile(scope, code, None).unwrap();
        let result = script.run(scope).unwrap();
        println!("{}", result.to_string(scope).unwrap().to_rust_string_lossy(scope));
    }

    pub fn set_global_func(&mut self, name: &str, )

    pub fn register_native_class(&mut self) {}
}