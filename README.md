# message-board

<h3>load balancer test</h3>
<ul>
  <li>在ec2上複製instance建立image檔</li>
  <li>用image檔啟動一台複製的instance</li>
  <li>並用ec2中的load balancers做負載平衡</li>
  <li>用loader.io對這兩台主機做壓力測試</li>
  <li>測試結果如下</li>
</ul>

client-500 duration-15sec  https://bit.ly/3wD05Q0
![image](https://user-images.githubusercontent.com/101098094/215283445-c0ba58fd-900f-4df8-961c-b277839be876.png)
client-1000 duration-15sec https://bit.ly/3Hc5KkZ
![image](https://user-images.githubusercontent.com/101098094/215283472-0431e95e-8c40-46d0-a1b5-7feeef047680.png)
client-2000 duration-15sec https://bit.ly/3jdI47O
![image](https://user-images.githubusercontent.com/101098094/215283484-fcb5ef19-4baa-4bba-9a8a-c5b70e7e0226.png)

<h3>架構</h3>
<ul>
  <li>aws-RDS建立mysql-database</li>
  <li>aws-S3用來儲存圖片</li>
  <li>aws-CloudFront用來加速圖片存取</li>
  <li>為了讓 client 可以上傳圖片到s3，client會先向後端請求presigned_url，後端會將presigned_url傳給client，client 則可藉由 presigned_url上傳圖檔到S3</li>
  <li>用 flask 架設後端 web application</li>
  <li>用 cache 減少訪問RDS頻率，並加快資料加載速度</li>
  <li>用nginx架設web server</li>
  <li>用docker部屬並上線</li>
  <li>將前端html js css分開達到mvc</li>
  
  ![image](https://user-images.githubusercontent.com/101098094/215284454-1bad88f6-956c-4e18-bf9e-06fc247f5fa7.png)

</ul>

