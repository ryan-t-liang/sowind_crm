type ServiceStatus = 'submitted'|'assigned'|'kit_sent'|'customer_sent'|'received'|'parts_ordering'|'repairing'|'repair_completed'|'return_sent'|'completed'|'rejected'|'cancelled';
type ServiceImage = {id:string;name:string;dataUrl:string};
type ServiceHistory = {id:string;status:ServiceStatus;title:string;time:string;note:string;actor:string};
interface ServiceTicket {
  revision?:string;
  id:string;brand:'GP'|'UN';customerId:string;customer:string;salutation:string;lastName:string;firstName:string;phone:string;reference:string;serial:string;reason:string;description:string;kitAddress:string;returnAddress:string;status:ServiceStatus;store:string;storePhone:string;advisor:string;created:string;updated:string;kitTracking:string;inboundTracking:string;outboundTracking:string;quote:string;quoteAmount:number|null;paymentConfirmed:boolean;serviceNote:string;receivedImages:ServiceImage[];serviceImages:ServiceImage[];rejectionReason:string;cancelReason:string;history:ServiceHistory[];
}
interface Window {
  SowindService: {
    getTickets(filter?:{brand?:string;customerId?:string}):ServiceTicket[];
    getTicket(id:string):ServiceTicket|null;
    createTicket(input:Partial<ServiceTicket>):ServiceTicket;
    updateTicket(id:string,patch:Partial<ServiceTicket>,actor?:'admin'|'customer'):ServiceTicket;
    transition(id:string,action:string,data?:Record<string,unknown>,actor?:'admin'|'customer'):ServiceTicket;
    subscribe(fn:()=>void):()=>void;
    statusCatalog:Record<ServiceStatus,{label:string;labelEn:string;tone:string;order:number}>;
    statusLabel(status:ServiceStatus,locale?:string):string;
    message(ticket:ServiceTicket,status:ServiceStatus,locale?:string):string;
    reasons:string[];canEdit(ticket:ServiceTicket):boolean;canCancel(ticket:ServiceTicket):boolean;
  };
  SowindI18n: {
    getLocale():string;
    setLocale(locale:string):void;
    toggle():void;
    translate(value:string,locale?:string):string;
    apply(root?:Node):void;
    subscribe(fn:(locale:string)=>void):()=>void;
    storageKey:string;
  };
}
