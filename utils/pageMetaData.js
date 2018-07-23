// A container for paging related information
class PageMetaData
{
    constructor(itemsPerPage, startPageIndex, endPageIndex)
    {
        this.itemsPerPage = itemsPerPage;
        this.startPageIndex = startPageIndex;
        this.endPageIndex = endPageIndex;
        this.currnetPageIndex = "";
    }

    // get itemsPerPage(){
    //     return this.itemsPerPage;
    // }
    //
    // get startPageIndex(){
    //     return this.startPageIndex;
    // }
    //
    // get endPageIndex(){
    //     return this.endPageIndex;
    // }
    //
    // get currentPageIndex(){
    //     return this.currentPageIndex;
    // }
    //
    // set itemsPerPage(itemsPerPage){
    //     this.itemsPerPage = itemsPerPage;
    // }
    //
    // set startPageIndex(startPageIndex){
    //     this.startPageIndex = startPageIndex;
    // }
    //
    // set endPageIndex(endPageIndex){
    //     this.endPageIndex = endPageIndex;
    // }
    //
    // set currentPageIndex(currentPageIndex){
    //     this.currentPageIndex = currentPageIndex;
    // }
}
