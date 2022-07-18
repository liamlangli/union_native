
use rusty_v8 as v8;
use std::fs;

mod class_define;
mod native;
mod object;
mod engine;

fn create_device(
    scope: &mut v8::HandleScope,
    _: v8::FunctionCallbackArguments,
    mut retval: v8::ReturnValue)
{
    retval.set(v8::String::new(scope, "not implemented").unwrap().into());
}
