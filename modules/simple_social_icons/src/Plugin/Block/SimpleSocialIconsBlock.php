<?php

/**
 * @file
 * Contains \Drupal\simple_social_icons\Plugin\Block\SimpleSocialIconsBlock.
 */

namespace Drupal\simple_social_icons\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;
use Symfony\Cmf\Component\Routing\RouteObjectInterface;

/**
 * Provides a 'SimpleSocialIconsBlock' block.
 *
 * @Block(
 *  id = "simple_social_icons_block",
 *  admin_label = @Translation("Simple social icons block"),
 * )
 */
class SimpleSocialIconsBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form['size'] = array(
      '#type' => 'range',
      '#title' => $this->t('Size'),
      '#description' => $this->t('Size of of icons in px.'),
      '#default_value' => isset($this->configuration['size']) ? $this->configuration['size'] : '38',
      '#weight' => '0',
    );
    $form['font_size'] = array(
      '#type' => 'range',
      '#title' => $this->t('Font Size'),
      '#description' => $this->t('Size of font of icons in px.'),
      '#default_value' => isset($this->configuration['font_size']) ? $this->configuration['font_size'] : '23',
      '#weight' => '0',
    );
    $form['radius'] = array(
      '#type' => 'range',
      '#title' => $this->t('Radius'),
      '#description' => $this->t('Icon radius in px'),
      '#default_value' => isset($this->configuration['radius']) ? $this->configuration['radius'] : '30',
      '#weight' => '0',
    );
    $form['spacing'] = array(
      '#type' => 'range',
      '#title' => $this->t('Spacing'),
      '#description' => $this->t('Margin between icons in px.'),
      '#default_value' => isset($this->configuration['spacing']) ? $this->configuration['spacing'] : '8',
      '#weight' => '0',
      '#attributes' => array(
      //'onblur' => 'simple_social_share_block_live_changes(this)',
      //'onclick' => 'simple_social_share_block_live_changes(this)'
      ),
    );
    $form['button_link_color'] = array(
      '#type' => 'color',
      '#title' => $this->t('Button/Link color'),
      '#description' => $this->t('Color of link'),
      '#default_value' => isset($this->configuration['button_link_color']) ? $this->configuration['button_link_color'] : 'auto',
      '#weight' => '0',
    );
    $form['icon_color'] = array(
      '#type' => 'color',
      '#title' => $this->t('Icon Color'),
      '#description' => $this->t('Color of icon'),
      '#default_value' => isset($this->configuration['icon_color']) ? $this->configuration['icon_color'] : '#ffffff',
      '#weight' => '0',
    );
    $form['use_default_style_ignore_colors'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Use default style & ignore colors.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['use_default_style_ignore_colors']) ? $this->configuration['use_default_style_ignore_colors'] : '',
      '#weight' => '0',
    );
    $form['contact_information'] = array(
      // '#markup' => '<a href="#">hello</a>',
      '#markup' => $this->icons([]),
      '#weight' => '-100',
      '#title' => 'Preview',
    );
    $form['#attached']['library'][] = 'simple_social_icons/simple_social_icons';
    $style = '.soc li a {
                /*size*/
                width: 38px;
                height: 38px;
                line-height: 38px;

                /*size 55%*/
                font-size: 20px;

                /*Radius*/
                -webkit-border-radius: 25px;
                -moz-border-radius: 25px;
                border-radius: 25px;

                /*Spacing*/
                margin-right: 7px;
    }';
    $form['#attached']['html_head'][] = [
      // The data.
      [
        // The HTML tag to add, in this case a <script> tag.
        '#tag' => 'style',
        // The value of the HTML tag, here we want to end up with <script>alert("Hello world!");</script>.
        '#value' => Markup::create($style),
      ],
      // A key, to make it possible to recognize this HTML <HEAD> element when altering.
      'hello-world'
    ];

    $form['simple_social_icons_twitter'] = array(
      '#type' => 'details',
      '#title' => t('Twitter settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_twitter']['twitter_via'] = array(
      '#type' => 'textfield',
      '#title' => t('Via'),
      '#default_value' => isset($this->configuration['twitter_via']) ? $this->configuration['twitter_via'] : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#weight' => '0',
    );
    $form['simple_social_icons_twitter']['twitter_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable twitter icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['twitter_enable']) ? $this->configuration['twitter_enable'] : 0,
      '#weight' => '1',
    );
    $form['simple_social_icons_twitter']['twitter_weight'] = array(
      '#type' => 'select',
      '#title' => t('Weight'),
      '#options' => [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4 ,5],
      '#default_value' => isset($this->configuration['twitter_weight']) ? $this->configuration['twitter_weight'] : '',
      '#description' => t(''),
      '#weight' => '2',
    );

    $form['simple_social_icons_linkedin'] = array(
      '#type' => 'details',
      '#title' => t('Linkedin settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_linkedin']['linkedin_summary'] = array(
      '#type' => 'textfield',
      '#title' => t('Summary'),
      '#default_value' => isset($this->configuration['linkedin_summary']) ? $this->configuration['linkedin_summary'] : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#weight' => '0',
    );
    $form['simple_social_icons_linkedin']['linkedin_source'] = array(
      '#type' => 'textfield',
      '#title' => t('Source'),
      '#default_value' => isset($this->configuration['linkedin_source']) ? $this->configuration['linkedin_source'] : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#weight' => '1',
    );
    $form['simple_social_icons_linkedin']['linkedin_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable linkedin icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['linkedin_enable']) ? $this->configuration['linkedin_enable'] : 0,
      '#weight' => '2',
    );

    $form['simple_social_icons_pinterest'] = array(
      '#type' => 'details',
      '#title' => t('Pinterest settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_pinterest']['pinterest_image_url'] = array(
      '#type' => 'textfield',
      '#title' => t('Image Url'),
      '#default_value' => isset($this->configuration['pinterest_image_url']) ? $this->configuration['pinterest_image_url'] : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#weight' => '0',
    );
    $form['simple_social_icons_pinterest']['pinterest_desc'] = array(
      '#type' => 'textfield',
      '#title' => t('Description'),
      '#default_value' => isset($this->configuration['pinterest_desc']) ? $this->configuration['pinterest_desc'] : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#weight' => '1',
    );
    $form['simple_social_icons_pinterest']['pinterest_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable Pinterest icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['pinterest_enable']) ? $this->configuration['pinterest_enable'] : 1,
      '#weight' => '2',
    );

    $form['simple_social_icons_email'] = array(
      '#type' => 'details',
      '#title' => t('Email settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_email']['email_subject'] = array(
      '#type' => 'textfield',
      '#title' => t('Subject'),
      '#default_value' => isset($this->configuration['email_subject']) ? $this->configuration['email_subject'] : '',
      '#size' => 60,
      '#maxlength' => 128,
    );
    $form['simple_social_icons_email']['email_body'] = array(
      '#type' => 'textarea',
      '#title' => t('Body'),
      '#default_value' => isset($this->configuration['email_body']) ? $this->configuration['email_body'] : '',
      '#size' => 60,
      '#maxlength' => 128,
    );
    $form['simple_social_icons_email']['email_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable Email icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['email_enable']) ? $this->configuration['email_enable'] : 0,
      '#weight' => '2',
    );

    $form['simple_social_icons_facebook'] = array(
      '#type' => 'details',
      '#title' => t('Facebook settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_facebook']['facebook_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable Facebook icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['facebook_enable']) ? $this->configuration['facebook_enable'] : 0,
      '#weight' => '2',
    );

    $form['simple_social_icons_googleplus'] = array(
      '#type' => 'details',
      '#title' => t('Google Plus settings'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => '',
    );
    $form['simple_social_icons_googleplus']['googleplus_enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Disable Google Plus icon.'),
      '#description' => $this->t(''),
      '#default_value' => isset($this->configuration['googleplus_enable']) ? $this->configuration['googleplus_enable'] : 0,
      '#weight' => '2',
    );

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockValidate($form, FormStateInterface $form_state) {

  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['size'] = $form_state->getValue('size');
    $this->configuration['font_size'] = $form_state->getValue('font_size');
    $this->configuration['radius'] = $form_state->getValue('radius');
    $this->configuration['spacing'] = $form_state->getValue('spacing');
    $this->configuration['button_link_color'] = $form_state->getValue('button_link_color');
    $this->configuration['icon_color'] = $form_state->getValue('icon_color');
    $this->configuration['use_default_style_ignore_colors'] = $form_state->getValue('use_default_style_ignore_colors');

    $this->configuration['twitter_via'] = $form_state->getValue('simple_social_icons_twitter')['twitter_via'];
    $this->configuration['twitter_enable'] = $form_state->getValue('simple_social_icons_twitter')['twitter_enable'];
    $this->configuration['twitter_weight'] = $form_state->getValue('simple_social_icons_twitter')['twitter_weight'];

    $this->configuration['linkedin_summary'] = $form_state->getValue('simple_social_icons_linkedin')['linkedin_summary'];
    $this->configuration['linkedin_source'] = $form_state->getValue('simple_social_icons_linkedin')['linkedin_source'];
    $this->configuration['linkedin_enable'] = $form_state->getValue('simple_social_icons_linkedin')['linkedin_enable'];

    $this->configuration['pinterest_image_url'] = $form_state->getValue('simple_social_icons_pinterest')['pinterest_image_url'];
    $this->configuration['pinterest_desc'] = $form_state->getValue('simple_social_icons_pinterest')['pinterest_desc'];
    $this->configuration['pinterest_enable'] = $form_state->getValue('simple_social_icons_pinterest')['pinterest_enable'];

    $this->configuration['email_subject'] = $form_state->getValue('simple_social_icons_email')['email_subject'];
    $this->configuration['email_body'] = $form_state->getValue('simple_social_icons_email')['email_body'];
    $this->configuration['email_enable'] = $form_state->getValue('simple_social_icons_email')['email_enable'];

    $this->configuration['facebook_enable'] = $form_state->getValue('simple_social_icons_facebook')['facebook_enable'];

    $this->configuration['googleplus_enable'] = $form_state->getValue('simple_social_icons_googleplus')['googleplus_enable'];
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $size = (isset($this->configuration['size']) ? $this->configuration['size'] : '38') . 'px';
    $font_size = (isset($this->configuration['font_size']) ? $this->configuration['font_size'] : '22') . 'px';
    $radius = (isset($this->configuration['radius']) ? $this->configuration['radius'] : '30') . 'px';
    $spacing = (isset($this->configuration['spacing']) ? $this->configuration['spacing'] : '8') . 'px';
    $button_link_color = isset($this->configuration['button_link_color']) ? $this->configuration['button_link_color'] : '#eee';
    $icon_color = isset($this->configuration['icon_color']) ? $this->configuration['icon_color'] : '#fffff';
    $default_style = isset($this->configuration['use_default_style_ignore_colors']) ? $this->configuration['use_default_style_ignore_colors'] : '';

    $twitter_via = isset($this->configuration['twitter_via']) ? $this->configuration['twitter_via'] : '';
    $twitter_enable = isset($this->configuration['twitter_enable']) ? $this->configuration['twitter_enable'] : '';
    $twitter_weight = isset($this->configuration['twitter_weight']) ? $this->configuration['twitter_weight'] : '';

    $linkedin_summary = isset($this->configuration['linkedin_summary']) ? $this->configuration['linkedin_summary'] : '';
    $linkedin_source = isset($this->configuration['linkedin_source']) ? $this->configuration['linkedin_source'] : '';
    $linkedin_enable = isset($this->configuration['linkedin_enable']) ? $this->configuration['linkedin_enable'] : '';

    $pinterest_image_url = isset($this->configuration['pinterest_image_url']) ? $this->configuration['pinterest_image_url'] : '';
    $pinterest_desc = isset($this->configuration['pinterest_desc']) ? $this->configuration['pinterest_desc'] : '';
    $pinterest_enable = isset($this->configuration['pinterest_enable']) ? $this->configuration['pinterest_enable'] : '';

    $email_subject = isset($this->configuration['email_subject']) ? $this->configuration['email_subject'] : '';
    $email_body = isset($this->configuration['email_body']) ? $this->configuration['email_body'] : '';
    $email_enable = isset($this->configuration['email_enable']) ? $this->configuration['email_enable'] : '';

    $facebook_enable = isset($this->configuration['facebook_enable']) ? $this->configuration['facebook_enable'] : '';

    $googleplus_enable = isset($this->configuration['googleplus_enable']) ? $this->configuration['googleplus_enable'] : '';

    if($default_style){
      $icon_color = '#ffffff';
      $button_link_color = 'none';
    }

    $output = array();
    $output[]['#cache']['max-age'] = 0; // No cache
    $values = [
      'twitter_via' => $twitter_via,
      'twitter_enable' => $twitter_enable,
      'linkedin_summary' => $linkedin_summary,
      'linkedin_source' => $linkedin_source,
      'linkedin_enable' => $linkedin_enable,
      'pinterest_image_url' => $pinterest_image_url,
      'pinterest_desc' => $pinterest_desc,
      'pinterest_enable' => $pinterest_enable,
      'email_subject' => $email_subject,
      'email_body' => $email_body,
      'email_enable' => $email_enable,
      'facebook_enable' => $facebook_enable,
      'googleplus_enable' => $googleplus_enable,
    ];
    $output[] = ['#markup' => $this->icons($values)];

    $style = ".soc li a {
            /*size*/
            width: $size;
            height: $size;
            line-height: $size;

            /*size 55%*/
            font-size: $font_size;

            /*Radius*/
            -webkit-border-radius: $radius;
            -moz-border-radius: $radius;
            border-radius: $radius;

            /*Spacing*/
            margin-right: $spacing;
            color: $icon_color !important;
            background-color: $button_link_color !important;
             /*color: #ffffff;*/
             /*background-color: none;*/
    }";

    $output['#attached']['html_head'][] = [
      // The data.
      [
        // The HTML tag to add, in this case a <script> tag.
        '#tag' => 'style',
        // The value of the HTML tag, here we want to end up with <script>alert("Hello world!");</script>.
        '#value' => Markup::create($style),
      ],
      // A key, to make it possible to recognize this HTML <HEAD> element when altering.
      'hello-world'
    ];

    $output['#attached']['library'][] = 'simple_social_icons/simple_social_icons';

    return $output;
  }

  /**
   * @param array $values
   * @return string
   */
  private function  icons(array $values) {
    $request = \Drupal::request();

    $url = Url::fromRoute('<current>');
    $url = $request->getHttpHost() . $url->toString();

    // Load the current node.
    $node = \Drupal::routeMatch()->getParameter('node');

    $site_config = \Drupal::config('system.site');

    $summary = $site_config->get('slogan');

    // Load the current node.
    if ($node) {
      $node_fields = $node->toArray();
      if (isset($node_fields['body'][0]['value'])) {
        $summary = substr($node_fields['body'][0]['value'], 0, 200);
      }
    }

    $route = $request->attributes->get(RouteObjectInterface::ROUTE_OBJECT);
    if ($route) {
      $title = \Drupal::service('title_resolver')->getTitle($request, $route);
    }
    elseif ($node) {
      $node_fields = $node->toArray();
      $title = $node_fields['title'][0]['value'];
    }
    else {
      // Default title will come here
      $title = $site_config->get('name');
    }

    if (!empty($values['twitter_via'])) {
      $twitter_icon = '<li><a class="soc-twitter" href="https://twitter.com/intent/tweet?source=' . $url . '&text=' . $title . ':' . $url . '&via=@'. $values['twitter_via'] . '" target="_blank" title="Tweet"></a></li>';
    }
    else {
      $twitter_icon = '<li><a class="soc-twitter" href="https://twitter.com/intent/tweet?source=' . $url . '&text=' . $title . ':' . $url . '&via=" target="_blank" title="Tweet"></a></li>';
    }

    $facebook_icon = '<li><a class="soc-facebook" href="https://www.facebook.com/sharer/sharer.php?u=' . $url . '&t=' . $title . '" target="_blank" title="Share on Facebook"></a></li>';

    if (!empty($values['pinterest_image_url']) && !empty($values['pinterest_desc'])) {
      $pinterest_icon = '<li><a class="soc-pinterest" href="https://pinterest.com/pin/create/button/?url=' . $url . '&media=' . $values['pinterest_image_url'] . '&description=' . $values['pinterest_desc'] . '"></a></li>';
    }
    else if (!empty($values['pinterest_image_url'])) {
      $pinterest_icon = '<li><a class="soc-pinterest" href="https://pinterest.com/pin/create/button/?url=' . $url . '&media=' . $values['pinterest_image_url'] . '&description="></a></li>';
    }
    else if (!empty($values['pinterest_desc'])) {
      $pinterest_icon = '<li><a class="soc-pinterest" href="https://pinterest.com/pin/create/button/?url=' . $url . '&media=&description=' . $values['pinterest_desc'] . '"></a></li>';
    }
    else {
      $pinterest_icon = '<li><a class="soc-pinterest" href="https://pinterest.com/pin/create/button/?url=' . $url . '&media=&description="></a></li>';
    }

    $google_icon = '<li><a class="soc-google" href="https://plus.google.com/share?url=' . $url . '" target="_blank" title="Share on Google+"></a></li>';

    if (!empty($values['linkedin_summary']) && !empty($values['linkedin_source'])) {
      $linked_in_icon = '<li><a class="soc-linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=' . $url . '&title=' . $title . '&source='. $values['linkedin_source'] .'&summary=' . $values['linkedin_summary'] . '" target="_blank"></a></li>';
    }
    else if (!empty($values['linkedin_source'])) {
      $linked_in_icon = '<li><a class="soc-linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=' . $url . '&title=' . $title . '&source='. $values['linkedin_source'] .'&summary=" target="_blank"></a></li>';
    }
    else if (!empty($values['linkedin_summary'])) {
      $linked_in_icon = '<li><a class="soc-linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=' . $url . '&title=' . $title . '&source=&summary=' . $values['linkedin_summary'] . '" target="_blank"></a></li>';
    }
    else {
      $linked_in_icon = '<li><a class="soc-linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=' . $url . '&title=' . $title . '&source=&summary=" target="_blank"></a></li>';
    }

    // $blog_icon = '<li><a class="soc-rss soc-icon-last" href="#"></a></li>';

    if (!empty($values['email_body']) && !empty($values['email_subject'])) {
      $email = '<li><a class="soc-email1" href="mailto:?&subject=' . $values['email_subject'] . '&body=' . $values['email_body'] . ' ' . $url . '"></a></li>';
    }
    else if(!empty($values['email_body'])) {
      $email = '<li><a class="soc-email1" href="mailto:?&subject=&body=' . $values['email_body'] . ' ' . $url . '"></a></li>';
    }
    else if(!empty($values['email_subject'])) {
      $email = '<li><a class="soc-email1" href="mailto:?&subject=' . $values['email_subject'] . '&body=' . $url . '"></a></li>';
    }
    else {
      $email = '<li><a class="soc-email1" href="mailto:?&subject=&body=' . $url . '"></a></li>';
    }

    $icons = '<ul class="soc">';
    if (!$values['twitter_enable']) {
      $icons .= $twitter_icon;
    }
    if (!$values['linkedin_enable']) {
      $icons .= $linked_in_icon;
    }
    if (!$values['pinterest_enable']) {
      $icons .= $pinterest_icon;
    }
    if (!$values['email_enable']) {
      $icons .= $email;
    }
    if (!$values['facebook_enable']) {
      $icons .= $facebook_icon;
    }
    if (!$values['googleplus_enable']) {
      $icons .= $google_icon;
    }
    $icons .= '</ul>';
    return $icons;

  }

}
