import { Request,Response,Router } from "express";
import { feed } from "./model";
import { Feed } from "src/interfaces/feedinterface";
import { Middleware } from "../../utils/middleware";


export class Feedscontroller{
    path:string
    router:Router;
    constructor(){
        this.router = Router() ;
        this.path = '' ;
        this.initRoute() ;
    }
    initRoute(){
        this.router.route('/feeds').get(new Middleware().authchecker,this.gettingfeeds).post(new Middleware().authchecker,this.postingfeed)
        this.router.route('/feeds/:id').patch(this.patchfeed).delete(this.deletefeed)
    }

    public async gettingfeeds(req:Request,res:Response){
        const data = await feed.findAll() 
        res.status(200).json({
            message:data,
            data:req.customData
        })
    }

    public async postingfeed(req:Request,res:Response) {
        const dt = req.customData
        req.body.userid = dt.uid;
        const data:Feed = req.body;
        await feed.create({...data});
        res.status(200).json({
            message:"success"
        })
    }

    public async patchfeed(req:Request,__res:Response) {
        const id = req.params.id
        console.log(typeof id)
        const feeds = await feed.findOne({
            where: {
                uid:id
            },
            attributes:['body']
        })

        const {body} = req.body;
        await feeds?.update({body})
    }

    public async deletefeed(req:Request,res:Response) {
        const id = req.params.id
        await feed.destroy({
            where:{
                uid:id
            }
        })
        res.status(200).json({
            message:"Successfully deleted"
        })
    }
}