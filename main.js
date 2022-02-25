const request = require('superagent');
const toml = require('toml');
const fs = require('fs');
const table = require('cli-table');

async function get(uid = "") {
    let page = await request.get("https://www.luogu.com.cn/user/" + uid).then(res => res.text);
    let data = page.match(/decodeURIComponent\("(.*?)"\)/i)[1];
    let json = JSON.parse(decodeURIComponent(data));
    return json.currentData.user.passedProblemCount;
}


function getUserID() {
    try {
        const text = fs.readFileSync('./user.toml', 'utf8');
        return toml.parse(text);
    } catch (err) {
        console.error(err)
    }
}

function getList(callback) {
    let lists = [];
    let promiseArr = [];

    getUserID()['user'].forEach(usr => {
        promiseArr.push(new Promise(async (resolve, reject) => {
            let name = usr['name'];
            let uid = usr['uid'];

            let num = await get(uid);
            lists.push({ name: name, num: num });

            resolve();
        }));
    });
    Promise.all(promiseArr).then(() => {
        callback(lists);
    });
}

function show(lists = []) {
    lists.sort((x, y) => y.num - x.num);
    let tb = new table({
        head: ['Name', 'AC'],
        colWidths: [30, 20],
        style: {
            head: [], border: []
        }
    });
    lists.forEach(usr => tb.push([usr.name, usr.num]));

    let str = "<pre>\n" + tb.toString() + "\n</pre>";

    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public");
    }
    fs.writeFileSync("./public/index.html", str, "utf8");
    console.log(tb.toString());
}

getList(show);


