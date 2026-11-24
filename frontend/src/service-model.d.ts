type ServiceStatus = 'submitted'|'assigned'|'kit_sent'|'customer_sent'|'received'|'payment'|'return_sent'|'completed'|'rejected'|'cancelled';
type ServiceImage = {id:string;name:string;dataUrl:string};
type ServiceHistory = {id:string;status:ServiceStatus;title:string;time:string;note:string;actor:string};
interface ServiceTicket {
  revision?:string;
  id:string;brand:'GP'|'UN';customerId:string;customer:string;salutation:string;lastName:string;firstName:string;phone:string;reference:string;serial:string;reason:string;description:string;kitAddress:string;returnAddress:string;status:ServiceStatus;store:string;storePhone:string;advisor:string;created:string;updated:string;kitTracking:string;inboundTracking:string;outboundTracking:string;quote:string;quoteAmount:number|null;serviceNote:string;receivedImages:ServiceImage[];serviceImages:ServiceImage[];rejectionReason:string;cancelReason:string;history:ServiceHistory[];
}
interface Window {
  SowindService: {
    getTickets(filter?:{brand?:string;customerId?:string}):ServiceTicket[];
    getTicket(id:string):ServiceTicket|null;
    createTicket(input:Partial<ServiceTicket>):ServiceTicket;
    updateTicket(id:string,patch:Partial<ServiceTicket>,actor?:'admin'|'customer'):ServiceTicket;
    transition(id:string,action:string,data?:Record<string,unknown>,actor?:'admin'|'customer'):ServiceTicket;
    subscribe(fn:()=>void):()=>void;
    statusCatalog:Record<ServiceStatus,{label:string;tone:string;order:number}>;
    reasons:string[];canEdit(ticket:ServiceTicket):boolean;canCancel(ticket:ServiceTicket):boolean;
  };
}
