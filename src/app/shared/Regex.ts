export class Regex{

    static readonly PhoneNumber:string = "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$";
    static readonly UserName:string = "^[a-z0-9_-]{3,15}$";
    static readonly Date:string = "(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})";
    static readonly  LettersNSpaces:string = "^[a-zA-Z ]+$";
    static readonly  Letters:string = "^[a-zA-Z]+$";
    static readonly  Name:string = "^[a-zA-Z 0-9,.']+$";
    static readonly  Desc:string= "^[a-zA-Z0-9 ,.']+$";
    static readonly  Numbers:string = "^[0-9 ]+$";
    static readonly  Password:string = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$";
    static readonly  SimpleEmail:string = "[^@ \\t\\r\\n]+@[^@ \\t\\r\\n]+\\.[^@ \\t\\r\\n]+";
    static readonly  LettersAndNumbers:string = "[a-zA-Z0-9]+";
}