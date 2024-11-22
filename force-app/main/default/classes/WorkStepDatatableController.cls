/**
 * @description       : 
 * @author            : maurizio.colombo@lynxspa.com
 * @group             : 
 * @last modified on  : 11-20-2024
 * @last modified by  : maurizio.colombo@lynxspa.com
**/
public without sharing class WorkStepDatatableController {
    @AuraEnabled(cacheable=true)   
    public static List<WorkStep> getWorkStep(boolean flag,String accountName, String opty){
        Map<String, Object> acctBinds = new Map<String, Object>{'accountName' => '%'+accountName+'%', 'opty'=>'%'+opty+'%'}; //, 'SST' => '%'}; //aggiungere valore SST
        String q='select id,workorderId,workorder.OpportunityNumber__c, workorder.WorkOrderNumber,workorder.subject, workorder.account.name, workorder.owner.name, workorderlineitem.subject,workorderlineitem.TICSample__c,name,Description,StatusImageFormula__c,Status,TICWSGroup__c from WorkStep where (workorder.account.name like :accountName and workorder.OpportunityNumber__c like :opty) order by workorder.OpportunityNumber__c ';   //AND workorder.PLSection__c like :SST';
         return Database.queryWithBinds(q,acctBinds,AccessLevel.USER_MODE);
    
    }
 
    @AuraEnabled
    public static String updateWorkStep(Object data){
       List<WorkStep> wsForUpdate = (List<WorkStep>) JSON.deserialize(
          JSON.serialize(data),
          List<WorkStep>.class
     );
     update wsForUpdate;
     return 'Success: workstep updated successfully';
     /*
     try {
         update wsForUpdate;
         return 'Success: contacts updated successfully';
     }
     catch (Exception e) {
         return 'The following exception has occurred: ' + e.getMessage();
     }
         */
    }
 }