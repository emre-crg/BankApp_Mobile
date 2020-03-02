const router = require('express').Router();
const verify = require('./verifyToken');
const AccountInfo = require('../model/accountInfo');
const AccountLog = require('../model/accountLog');
const User = require('../model/user');

const {newAccountValidation} = require('../validation');

//NEW ACCOUNT
router.post('/newaccount',verify, async (req, res) => {

    //Validasyon => hesap nesnesi
    const {error} = newAccountValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //HesapNoExist => HesapNo Eşsiz olmalı: kontrol edilir..
    const HesapNoExist = await AccountInfo.findOne({hesapNo: req.body.hesapNo});
    if(HesapNoExist) return res.status(400).send(req.body.hesapNo +': Bu hesap numarası zaten mevcut');

    //Hesap sahibinin tc'si user modelinden gelir...    
    const user = await User.findOne({_id: req.user._id});


    const account = new AccountInfo({
        hesapSahibiTc: user.tcKimlikNo,
        hesapNo: req.body.hesapNo,  //Hesap numarasının otomatik gelmesi lazım. Eklenecek...
        hesapAdi: req.body.hesapAdi,
        hesapAciklamasi: req.body.hesapAciklamasi
    });
    try {
        const savedAccount = await account.save();
        res.send(savedAccount);

    } catch (err) {
        res.status(400).send(err);
    }


    //Hesap Log'ları hesap bilgileri oluşturulduğu anda oluşur.
    const accountLog = new AccountLog({
        hesapNo: account.hesapNo        
    });
    try {
        const savedAccountLog = await accountLog.save();
        res.send(savedAccountLog);
    } catch (err) {
        res.status(400).send(err);
    }

});

//Para yatırma
router.put('/parayatirma',verify, async (req, res) => {
    
    const user = await User.findOne({_id: req.user._id});
    
    const tcExist = await AccountInfo.findOne({hesapSahibiTc: user.tcKimlikNo});
    if(!tcExist) return res.status(400).send('Bu kullanıcıya kayıtlı hesap bulunmamaktadır.'); 
    
    //Burası çokomelli.. hesapNo => hesap {HesapNo'dan elde ettiği accountInfo.hesapSahibiTc nesnesi ile token'dan gelen user.tcKimlikNo aynımı ?}
    const hesap = await AccountInfo.findOne({hesapNo: req.body.hesapNo});
    if(hesap.hesapSahibiTc != user.tcKimlikNo) return res.status(400).send('Bu kullanıcının işlem yapmaya yetkisi yoktur.');



    await AccountInfo.findOne({hesapNo: req.body.hesapNo}, function(err, results){

        var money;
        var dbhesap = Number(results.hesapBakiyesi); 

        //Client'tan gelen para datası.
        var reqhesap = Number(req.body.para);
        //Toplama 
        money = dbhesap + reqhesap;

        AccountInfo.findOneAndUpdate({hesapNo: req.body.hesapNo}, {$set:{hesapBakiyesi: money}}, {new: true}).then((data) =>{
            if(data === null){
                throw new Error('Error');
            }
            res.json({ message: data })
        }).catch( (error) => {
            
            res.status(500).json({ message: 'Some Error!' })
            console.log(error);
        });

        
        //Logların kaydı.
        const accountLog = new AccountLog({
            hesapNo: results.hesapNo,
            islemTürü: 'Para yatırma.',
            islemBilgileri: req.body.para + ' TL para yatırıldı.'
        });
        try {
            accountLog.save();
        } catch (err) {
            res.status(400).send(err);
        }
            
    });

});

//Para çekme
router.put('/paraycekme',verify, async (req, res) => {
    
    const user = await User.findOne({_id: req.user._id});
    
    //bu kullanıcının hesabı var mı?
    const tcExist = await AccountInfo.findOne({hesapSahibiTc: user.tcKimlikNo});
    if(!tcExist) return res.status(400).send('Bu kullanıcıya kayıtlı hesap bulunmamaktadır.');
    
    //Kullanıcını böyle bir hesabı var mı?
    const hesap = await AccountInfo.findOne({hesapNo: req.body.hesapNo});
    if(hesap.hesapSahibiTc != user.tcKimlikNo) return res.status(400).send('Bu kullanıcının işlem yapmaya yetkisi yoktur.');
 
    await AccountInfo.findOne({hesapNo: req.body.hesapNo}, function(err, results){
 
        var money;
        var dbhesap = Number(results.hesapBakiyesi); 
        
         //Client'tan gelen para datası.
         var reqhesap = Number(req.body.para);

         //VALIDASYON ==> Hesapdaki bakiyeden daha fazlasınımı çıkarıyorsun ?
         if(reqhesap > dbhesap) 
         return res.status(400).send('Hesabınızda ki bakiyeden daha fazlasını çekemezsiniz.Lüfen hesabınızı konrol edip tekrar deneyin.');

         //Veri tabanındaki bakiye ile req bakiye çılarılır.
         money = dbhesap - reqhesap;
         AccountInfo.findOneAndUpdate({hesapNo: req.body.hesapNo}, {$set:{hesapBakiyesi: money}}, {new: true}).then((data) =>{
             if(data === null){
                 throw new Error('Error');
             }
             res.json({ message: data })
         }).catch( (error) => {
             
             res.status(500).json({ message: 'Some Error!' })
             console.log(error);
         });
 
        //Logların kaydı.
        const accountLog = new AccountLog({
            hesapNo: results.hesapNo,
            islemTürü: 'Para çekme.',
            islemBilgileri: req.body.para + ' TL para çekildi.'
        });
        try {
            accountLog.save();
        } catch (err) {
            res.status(400).send(err);
        }

    });
 
 }); 


//Havale
router.put('/havale',verify, async (req, res) => {
    
    const user = await User.findOne({_id: req.user._id});
    
    const tcExist = await AccountInfo.findOne({hesapSahibiTc: user.tcKimlikNo});
    if(!tcExist) return res.status(400).send('Bu kullanıcıya kayıtlı hesap bulunmamaktadır.'); 
    
    //Burası çokomelli.. hesapNo => hesap {HesapNo'dan elde ettiği accountInfo.hesapSahibiTc nesnesi ile token'dan gelen user.tcKimlikNo aynımı ?}
    const hesap = await AccountInfo.findOne({hesapNo: req.body.hesapNo});
    if(hesap.hesapSahibiTc != user.tcKimlikNo) return res.status(400).send('Bu kullanıcının işlem yapmaya yetkisi yoktur.');

    const HedefHesapExist = await AccountInfo.findOne({hesapNo: req.body.hedefHesapNo});
    if(!HedefHesapExist) return res.status(400).send('Böyle bir hesap yok. Havale göndermek için bilgilerinizi kontrol edin.');


    await AccountInfo.findOne({hesapNo: req.body.hesapNo}, function(err, results){

        var haveleYapan;
        var dbhesap = Number(results.hesapBakiyesi);

        //Client'tan gelen para datası.
        var reqhesap = Number(req.body.para);
        //Havale İşlemi 
        haveleYapan = dbhesap - reqhesap;

        AccountInfo.findOneAndUpdate({hesapNo: req.body.hesapNo}, {$set:{hesapBakiyesi: haveleYapan}}, {new: true}).then((data) =>{
            if(data === null){
                throw new Error('Error');
            }
            res.json({ message: data })
        
        //Logların kaydı.
        const accountLog = new AccountLog({
            hesapNo: results.hesapNo,
            islemTürü: 'Havale Yapıldı.',
            islemBilgileri: req.body.para + ' TL para havale ile gönderildi.'
        });
        try {
            accountLog.save();
        } catch (err) {
            res.status(400).send(err);
        }

        }).catch( (error) => {
            
            res.status(500).json({ message: 'Some Error!' })
            console.log(error);
        });

        AccountInfo.findOne({hesapNo: req.body.hedefHesapNo}, function(err, results){
            
            var hedefHesapBakiye = Number(results.hesapBakiyesi);
            var reqhesap = Number(req.body.para);
            //Havale İşlemi 
            var haveleAlan = hedefHesapBakiye + reqhesap;

            AccountInfo.findOneAndUpdate({hesapNo: req.body.hedefHesapNo}, {$set:{hesapBakiyesi: haveleAlan}}, {new: true})
            .then((data) => {
                if(data === null){
                    throw new Error('Error');
                }
                //Logların kaydı.
                const accountLog = new AccountLog({
                    hesapNo: results.hesapNo,
                    islemTürü: 'Havale Alındı.',
                    islemBilgileri: req.body.para + ' TL para havale ile alındı.'
                });
                try {
                    accountLog.save();
                } catch (err) {
                    res.status(400).send(err);
                }     
            })
            .catch((error) => {
                res.status(500).json({ message: 'Some Error!' })
                console.log(error);                
            });
        });   
                
            
    });//ilk awaid findeOne

});


module.exports = router;