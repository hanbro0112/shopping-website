const express = require('express');

const app = express();
const port = 8080;

// 靜態檔案路徑
app.use(express.static(`${__dirname}/views`));

// 設定 view engine  # 預設 ./views
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
