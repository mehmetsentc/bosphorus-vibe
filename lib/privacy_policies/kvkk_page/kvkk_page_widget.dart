import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'kvkk_page_model.dart';
export 'kvkk_page_model.dart';

class KvkkPageWidget extends StatefulWidget {
  const KvkkPageWidget({super.key});

  static String routeName = 'Kvkk_page';
  static String routePath = '/kvkkPage';

  @override
  State<KvkkPageWidget> createState() => _KvkkPageWidgetState();
}

class _KvkkPageWidgetState extends State<KvkkPageWidget> {
  late KvkkPageModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => KvkkPageModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        appBar: responsiveVisibility(
          context: context,
          tabletLandscape: false,
          desktop: false,
        )
            ? AppBar(
                backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
                automaticallyImplyLeading: false,
                title: Row(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    if (responsiveVisibility(
                      context: context,
                      phone: false,
                      tablet: false,
                    ))
                      Container(
                        width: 200.0,
                        height: 100.0,
                        decoration: BoxDecoration(),
                      ),
                    if (responsiveVisibility(
                      context: context,
                      phone: false,
                      tablet: false,
                      tabletLandscape: false,
                      desktop: false,
                    ))
                      Text(
                        'Page Title',
                        style: FlutterFlowTheme.of(context)
                            .headlineMedium
                            .override(
                              font: GoogleFonts.outfit(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).primaryText,
                              fontSize: 22.0,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .headlineMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .headlineMedium
                                  .fontStyle,
                            ),
                      ),
                    FlutterFlowIconButton(
                      borderColor: Colors.transparent,
                      borderRadius: 30.0,
                      borderWidth: 1.0,
                      buttonSize: 60.0,
                      icon: Icon(
                        Icons.chevron_left,
                        color: FlutterFlowTheme.of(context).primaryText,
                        size: 30.0,
                      ),
                      onPressed: () async {
                        context.pop();
                      },
                    ),
                  ],
                ),
                actions: [],
                centerTitle: false,
                elevation: 2.0,
              )
            : null,
        body: SafeArea(
          top: true,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              if (responsiveVisibility(
                context: context,
                phone: false,
                tablet: false,
              ))
                Container(
                  width: 200.0,
                  height: 100.0,
                  decoration: BoxDecoration(),
                ),
              Expanded(
                child: Container(
                  width: 100.0,
                  height: double.infinity,
                  decoration: BoxDecoration(
                    color: FlutterFlowTheme.of(context).secondaryBackground,
                  ),
                  child: Container(
                    decoration: BoxDecoration(),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 8.0, 0.0, 12.0),
                                child: Text(
                                  '🔒 KVKK Porty App (Porty Club)',
                                  textAlign: TextAlign.start,
                                  style: FlutterFlowTheme.of(context)
                                      .headlineSmall
                                      .override(
                                        font: GoogleFonts.outfit(
                                          fontWeight: FontWeight.w600,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .headlineSmall
                                                  .fontStyle,
                                        ),
                                        fontSize: 16.0,
                                        letterSpacing: 0.0,
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .headlineSmall
                                            .fontStyle,
                                      ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 20.0),
                              child: Text(
                                'Etkinlik tarihie: Nisan 2025',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .labelMedium
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryBackground,
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 0.0, 12.0),
                                  child: Text(
                                    '🛡️ KİŞİSEL VERİLERİN KORUNMASI HAKKINDA AYDINLATMA METNİ\nYürürlük Tarihi: Nisan 2025\n\nPorty App (Porty Club) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, kullanıcılarımızın kişisel verilerinin gizliliğini ve güvenliğini önemsiyoruz. Bu metin, kişisel verilerinizin ne şekilde işlendiği, saklandığı ve hangi haklara sahip olduğunuz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.\n\n📌 Veri Sorumlusu Bilgileri\nPort Nature Luxury Resort Hotel\nAdres: Boğazkent Mahallesi 40. Sokak No:4, Belek, Serik, Antalya\nTelefon: +90 (242) 731 07 07\nWeb: www.portcub.com\n\n📦 İşlenen Kişisel Veriler\nUygulama kapsamında aşağıdaki kişisel verileriniz işlenebilir:\n\nAd, soyad\n\nE-posta adresi\n\nOda numarası (isteğe bağlı)\n\nPaylaştığınız görsel, video ve metin içerikleri\n\nSohbet mesajlarınız\n\nIP adresiniz ve cihaz bilgileri\n\n🎯 Verilerin İşlenme Amaçları\nEtkinlik bilgilendirmeleri ve hatırlatmaları sunmak\n\nİçerik paylaşımı ve sosyal etkileşim sağlamak\n\nSohbet ve mesajlaşma özelliklerini sunmak\n\nTopluluk kurallarına aykırı içerikleri denetlemek\n\nGüvenli bir kullanıcı deneyimi sunmak\n\n🕒 Veri Saklama Süresi\nKişisel verileriniz, yalnızca yukarıdaki amaçların gerçekleştirilmesi için gerekli süre boyunca saklanır. Bu süre en fazla 1 yıldır. Kullanıcı talep ettiğinde veriler kalıcı olarak silinir veya anonim hale getirilir.\n\n👤 KVKK Kapsamındaki Haklarınız\nKVKK\'nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:\n\nKişisel verinizin işlenip işlenmediğini öğrenme\n\nVerileriniz işlenmişse bilgi talep etme\n\nVerilerin düzeltilmesini veya silinmesini isteme\n\nİşlemenin sınırlandırılmasını veya durdurulmasını talep etme\n\nVerilerinizin yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri öğrenme\n\nİşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme\n\nKişisel verilerinizin hukuka aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararınızın giderilmesini talep etme\n\n📨 Başvuru Yöntemi\nKVKK kapsamındaki tüm taleplerinizi, aşağıdaki e-posta adresi üzerinden yazılı olarak iletebilirsiniz:\n\nE-posta: info@portcub.com\n\n📝 Ek Bilgilendirme\nBu metin, Porty App (Porty Club) uygulamasının kullanım şartları ve gizlilik politikası kapsamında, kişisel verilerinizin korunmasına yönelik olarak hazırlanmıştır.\n\n',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                              ),
                            ),
                            Divider(
                              height: 24.0,
                              thickness: 1.0,
                              color: FlutterFlowTheme.of(context).alternate,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              if (responsiveVisibility(
                context: context,
                phone: false,
                tablet: false,
              ))
                Container(
                  width: 200.0,
                  height: 100.0,
                  decoration: BoxDecoration(),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
