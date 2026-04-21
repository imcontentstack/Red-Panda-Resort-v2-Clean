import { NextResponse } from "next/server";

export async function POST(req, res){
    const formdata = await req.formData();
    console.log(formdata);

    var object = {};
    formdata.forEach((value, key) => object[key] = value);
    var json = JSON.stringify(object);

    let automateResponse = await fetch('https://app.contentstack.com/automations-api/run/63c03644823b435f93ea88e04d5a7f20', {
        method: 'POST',
        body: json
    })

    let response = await automateResponse.json();

    return NextResponse.json({result: "success"});

}